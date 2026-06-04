import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import Home from "./page";

type EventHandler = (event: MessageEvent<string>) => void;

class MockEventSource {
  static instances: MockEventSource[] = [];

  url: string;
  listeners = new Map<string, EventHandler>();
  close = jest.fn();
  onerror: (() => void) | null = null;

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  addEventListener(eventName: string, handler: EventHandler) {
    this.listeners.set(eventName, handler);
  }

  emit(eventName: string, data: unknown) {
    this.listeners.get(eventName)?.({
      data: typeof data === "string" ? data : JSON.stringify(data),
    } as MessageEvent<string>);
  }
}

const transactionResponse = {
  event: {
    eventId: "event-1",
    occurredAt: "2026-06-04T10:00:00.000Z",
    data: {
      transactionId: "txn-1",
      userId: "user-101",
      accountId: "acc-5001",
      type: "CREDIT",
      amount: 2500,
      status: "PENDING",
    },
  },
};

const notificationEvent = {
  eventId: "notification-1",
  eventType: "notification.created",
  occurredAt: "2026-06-04T10:00:05.000Z",
  data: {
    userId: "user-101",
    transactionId: "txn-1",
    accountId: "acc-5001",
    status: "COMPLETED",
    message: "Transaction completed successfully",
    updatedBalance: 2500,
  },
};

describe("Banking Event Console", () => {
  beforeEach(() => {
    MockEventSource.instances = [];
    global.EventSource = MockEventSource as unknown as typeof EventSource;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => transactionResponse,
    }) as jest.Mock;
  });

  it("renders dashboard controls and metrics", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: "Banking Event Console" })).toBeInTheDocument();
    expect(screen.getByLabelText("User ID")).toHaveValue("user-101");
    expect(screen.getByLabelText("Account ID")).toHaveValue("acc-5001");
    expect(screen.getByRole("button", { name: "Publish Event" })).toBeInTheDocument();
  });

  it("connects to notification SSE for the selected user", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.click(screen.getByRole("button", { name: "Connect" }));

    expect(MockEventSource.instances[0].url).toBe(
      "http://localhost:3002/v1/api/events/user-101"
    );

    act(() => {
      MockEventSource.instances[0].emit("connected", {
        userId: "user-101",
        message: "connected",
      });
    });

    expect(await screen.findByText("connected")).toBeInTheDocument();
  });

  it("publishes a transaction request and shows it as pending", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.click(screen.getByRole("button", { name: "Publish Event" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/v1/api/transactions",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            userId: "user-101",
            accountId: "acc-5001",
            type: "CREDIT",
            amount: 2500,
          }),
        })
      );
    });

    expect(await screen.findByText("txn-1")).toBeInTheDocument();
  });

  it("shows live notification events from SSE", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.click(screen.getByRole("button", { name: "Connect" }));
    act(() => {
      MockEventSource.instances[0].emit("notification", notificationEvent);
    });

    expect(
      await screen.findByText("Transaction completed successfully")
    ).toBeInTheDocument();
    expect(screen.getAllByText("₹2,500").length).toBeGreaterThan(0);
  });
});
