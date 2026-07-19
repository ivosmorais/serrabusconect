import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  MonitorSmartphone,
  Megaphone,
  FileText,
  Bus,
  ArrowLeft,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel Administrativo — Serra SmartBus" },
      { name: "description", content: "Painel administrativo do Serra SmartBus para gestão de monitores, conteúdo e publicidade." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/monitores", label: "Monitores", icon: MonitorSmartphone },
  { to: "/admin/conteudo", label: "Conteúdo", icon: FileText },
  { to: "/admin/publicidade", label: "Publicidade", icon: Megaphone },
];

function AdminSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-mint text-navy-deep">
            <Bus className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-lg tracking-wide text-white">SmartBus</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">Admin</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Módulos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.to} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/" className="flex items-center gap-2 text-white/70">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Voltar ao Monitor</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-radial-navy">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex h-14 items-center gap-3 border-b border-white/10 bg-navy-deep/50 px-4 backdrop-blur">
            <SidebarTrigger className="text-white" />
            <div className="flex flex-col leading-tight">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Prefeitura da Serra</span>
              <span className="font-display text-lg tracking-wide text-white">Painel Administrativo</span>
            </div>
          </header>
          <main className="flex-1 p-6 text-white">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
