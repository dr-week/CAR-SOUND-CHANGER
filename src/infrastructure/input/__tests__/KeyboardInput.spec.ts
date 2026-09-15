import { describe, expect, it, vi } from "vitest";
import { KeyboardInput } from "../KeyboardInput";

class MockKeyboardEvent extends Event {
  code: string;
  key: string;
  repeat = false;
  ctrlKey = false;
  altKey = false;
  metaKey = false;

  constructor(type: string, code: string, key: string) {
    super(type, { cancelable: true });
    this.code = code;
    this.key = key;
  }
}

describe("KeyboardInput", () => {
  it("triggers accelerate on W, ArrowUp keys and releases on keyup", () => {
    const target = new EventTarget();
    const onControl = vi.fn();
    const onShift = vi.fn();
    const input = new KeyboardInput(onControl, onShift, target);

    const cleanup = input.start();

    // Press 'w'
    target.dispatchEvent(new MockKeyboardEvent("keydown", "KeyW", "w"));
    expect(onControl).toHaveBeenCalledWith("accelerate", true);

    // Release 'w'
    target.dispatchEvent(new MockKeyboardEvent("keyup", "KeyW", "w"));
    expect(onControl).toHaveBeenCalledWith("accelerate", false);

    // Press ArrowUp
    target.dispatchEvent(new MockKeyboardEvent("keydown", "ArrowUp", "ArrowUp"));
    expect(onControl).toHaveBeenCalledWith("accelerate", true);

    cleanup();
  });

  it("triggers brake on S, ArrowDown, and Spacebar", () => {
    const target = new EventTarget();
    const onControl = vi.fn();
    const onShift = vi.fn();
    const input = new KeyboardInput(onControl, onShift, target);

    const cleanup = input.start();

    target.dispatchEvent(new MockKeyboardEvent("keydown", "Space", " "));
    expect(onControl).toHaveBeenCalledWith("brake", true);

    target.dispatchEvent(new MockKeyboardEvent("keyup", "Space", " "));
    expect(onControl).toHaveBeenCalledWith("brake", false);

    cleanup();
  });

  it("triggers upshift on 1/Q and downshift on 2/E", () => {
    const target = new EventTarget();
    const onControl = vi.fn();
    const onShift = vi.fn();
    const input = new KeyboardInput(onControl, onShift, target);

    const cleanup = input.start();

    // Upshift via Q
    target.dispatchEvent(new MockKeyboardEvent("keydown", "KeyQ", "q"));
    expect(onShift).toHaveBeenCalledWith(1);

    // Downshift via E
    target.dispatchEvent(new MockKeyboardEvent("keydown", "KeyE", "e"));
    expect(onShift).toHaveBeenCalledWith(-1);

    cleanup();
  });
});
