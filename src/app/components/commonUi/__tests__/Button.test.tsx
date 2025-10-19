import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../Button";

describe("Button", () => {
  it("renders children and applies default styles", () => {
    render(<Button>Test Button</Button>);

    const button = screen.getByRole("button", { name: "Test Button" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-[hsl(118,100%,70%)]");
    expect(button).not.toBeDisabled();
  });

  it("merges custom className and disables when loading", () => {
    render(
      <Button isLoading loadingText="Kraunama..." className="custom-class">
        Hidden Text
      </Button>,
    );

    const button = screen.getByRole("button", { name: /Kraunama/ });
    expect(button).toBeDisabled();
    expect(button).toHaveClass("custom-class");

    const loaders = screen.getAllByAltText("Loading");
    expect(loaders).toHaveLength(2);
  });

  it("respects the outline variant and forwards click events", async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();

    render(
      <Button variant="outline" onClick={onClick}>
        Spausti
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Spausti" });
    expect(button).toHaveClass("border-2");
    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies fullWidth flag and size specific classes", () => {
    render(
      <Button size="sm" fullWidth>
        Smaller Button
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Smaller Button" });
    expect(button).toHaveClass("w-full");
    expect(button).toHaveClass("px-3", "py-2", "text-sm");
  });

  it("forwards the disabled prop even when not loading", async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();

    render(
      <Button disabled onClick={onClick}>
        Static
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Static" });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("falls back to children text when loadingText is missing", () => {
    render(<Button isLoading>Paslaptingas tekstas</Button>);

    expect(screen.getByRole("button", { name: /Paslaptingas/ })).toBeDisabled();
  });

  it("exposes the destructive variant styles", () => {
    render(<Button variant="destructive">Pavojus</Button>);

    const button = screen.getByRole("button", { name: "Pavojus" });
    expect(button).toHaveClass("bg-red-600");
    expect(button).toHaveClass("hover:bg-red-700");
  });

  it("passes button props through to the underlying element", async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();

    render(
      <Button type="submit" data-testid="submitter" onClick={onClick}>
        Patvirtinti
      </Button>,
    );

    const button = screen.getByTestId("submitter");
    expect(button).toHaveAttribute("type", "submit");
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
