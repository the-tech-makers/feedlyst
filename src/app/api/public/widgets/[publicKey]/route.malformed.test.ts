import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("public widget endpoint", () => {
  it("does not throw on malformed referer", async () => {
    const request = new Request("https://feedlyst.example/api/public/widgets/demo", {
      headers: { referer: "not-a-url" },
    });
    try {
      const response = await GET(request, { params: Promise.resolve({ publicKey: "missing" }) });
      expect(response.status).toBe(404);
    } catch {
      throw new Error("malformed referer should never crash request handling");
    }
  });
});
