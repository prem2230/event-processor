import { v4 as uuidv4 } from "uuid";

class IdGenerator {
    public static generateId(): string {
        return uuidv4();
    }
}

export const generateId = IdGenerator.generateId;
export default IdGenerator;
