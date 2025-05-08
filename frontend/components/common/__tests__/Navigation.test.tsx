import { render, screen, fireEvent } from "@testing-library/react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import NavigationBar from "../NavigationBar";
import SidebarMenu from "../SidebarMenu";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock AuthContext
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    main: ({ children, ...props }: any) => <main {...props}>{children}</main>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe("NavigationBar", () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockUser = {
    name: "Test User",
    email: "test@example.com",
    avatar: null,
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePathname as jest.Mock).mockReturnValue("/dashboard");
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      logout: jest.fn(),
    });
  });

  it("renders navigation links correctly", () => {
    render(<NavigationBar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Analysis")).toBeInTheDocument();
    expect(screen.getByText("Reports")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("toggles mobile menu when hamburger button is clicked", () => {
    render(<NavigationBar />);
    const menuButton = screen.getByLabelText(/open menu/i);
    fireEvent.click(menuButton);
    expect(screen.getByLabelText(/close menu/i)).toBeInTheDocument();
  });

  it("toggles search bar when search button is clicked", () => {
    render(<NavigationBar />);
    const searchButton = screen.getByLabelText("Search");
    fireEvent.click(searchButton);
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("displays user profile information", () => {
    render(<NavigationBar />);
    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
  });
});

describe("SidebarMenu", () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockUser = {
    name: "Test User",
    email: "test@example.com",
    avatar: null,
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePathname as jest.Mock).mockReturnValue("/dashboard");
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      logout: jest.fn(),
    });
  });

  it("renders all menu sections", () => {
    render(<SidebarMenu />);
    expect(screen.getByText("Metrics")).toBeInTheDocument();
    expect(screen.getByText("Monitoring")).toBeInTheDocument();
    expect(screen.getByText("Reports")).toBeInTheDocument();
    expect(screen.getByText("Management")).toBeInTheDocument();
  });

  it("highlights active menu item", () => {
    render(<SidebarMenu />);
    const dashboardLink = screen.getByText("Dashboard").closest("a");
    expect(dashboardLink).toHaveClass("text-white");
  });

  it("collapses and expands sidebar", () => {
    const onToggle = jest.fn();
    render(<SidebarMenu isCollapsed={false} onToggle={onToggle} />);
    const toggleButton = screen.getByRole("button", { name: /toggle/i });
    fireEvent.click(toggleButton);
    expect(onToggle).toHaveBeenCalled();
  });

  it("shows tooltips for collapsed menu items", () => {
    render(<SidebarMenu isCollapsed={true} />);
    const dashboardLink = screen.getByText("Dashboard").closest("a");
    fireEvent.mouseEnter(dashboardLink!);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("handles logout", () => {
    const mockLogout = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    });

    render(<SidebarMenu />);
    const logoutButton = screen.getByText("Sign out");
    fireEvent.click(logoutButton);
    expect(mockLogout).toHaveBeenCalled();
  });
});
