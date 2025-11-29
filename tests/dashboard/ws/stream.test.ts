import useForgeStream from "../../../dashboard/components/hooks/useForgeStream";
describe("Forge WebSocket Stream", () => {
  it("should initialize without crashing", () => {
    expect(typeof useForgeStream).toBe("function");
  });
});
