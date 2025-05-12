"use client"

import { useState } from "react"
import { MapPin, Search, Bell, Plus, Filter, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { MapComponent } from "@/components/map-component"
import { TheftReportModal } from "@/components/theft-report-modal"

export default function Home() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("map")

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <main className="flex-1">
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h1 className="text-xl font-bold">RideBack</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  3
                </Badge>
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Brooklyn, NY</span>
              </div>
              <Button onClick={() => setIsReportModalOpen(true)} className="gap-1 bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4" />
                Report Theft
              </Button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search bikes, scooters, or listings..." className="pl-9" />
            </div>

            <Tabs defaultValue="map" className="mb-4" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="map">Map View</TabsTrigger>
                <TabsTrigger value="listings">Marketplace</TabsTrigger>
              </TabsList>
              <TabsContent value="map" className="mt-2">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold">Reported Thefts</h2>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </div>
                <div className="h-[60vh] rounded-lg overflow-hidden border">
                  <MapComponent />
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Recent Reports Nearby</h3>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {recentReports.map((report) => (
                        <ReportCard key={report.id} report={report} />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
              <TabsContent value="listings" className="mt-2">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold">Marketplace Listings</h2>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </div>
                <ScrollArea className="h-[calc(100vh-240px)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {marketplaceListings.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <TheftReportModal open={isReportModalOpen} onOpenChange={setIsReportModalOpen} />
    </SidebarProvider>
  )
}

function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-red-600 p-1">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold">RideBack</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Home</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span>My Reports</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              <span>Saved</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
              <span>Community</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span>Help</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-muted-foreground">Recovery Hero • Level 3</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

function ReportCard({ report }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <div className="relative h-24 w-24 flex-shrink-0">
          <img src={report.image || "/placeholder.svg"} alt={report.title} className="h-full w-full object-cover" />
          {report.reward > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-green-600 px-1 py-0.5 text-center text-xs font-medium text-white">
              ${report.reward} Reward
            </div>
          )}
        </div>
        <div className="flex-1 p-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium line-clamp-1">{report.title}</h3>
              <p className="text-xs text-muted-foreground">{report.location}</p>
              <p className="text-xs text-muted-foreground">{report.date}</p>
            </div>
            <Badge variant={report.type === "bike" ? "default" : "secondary"} className="ml-2">
              {report.type}
            </Badge>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
              View Details
            </Button>
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
              Contact
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

function ListingCard({ listing }) {
  return (
    <Card
      className={cn("overflow-hidden transition-all hover:shadow-md", listing.suspicious && "border-red-200 bg-red-50")}
    >
      <div className="relative">
        <img src={listing.image || "/placeholder.svg"} alt={listing.title} className="h-48 w-full object-cover" />
        {listing.suspicious && (
          <div className="absolute right-2 top-2 rounded-full bg-red-600 p-1">
            <AlertTriangle className="h-4 w-4 text-white" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <p className="font-bold text-white">${listing.price}</p>
        </div>
      </div>
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium line-clamp-1">{listing.title}</h3>
            <p className="text-xs text-muted-foreground">{listing.location}</p>
            <p className="text-xs text-muted-foreground">
              {listing.platform} • {listing.date}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-3 pt-0">
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
          View Listing
        </Button>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
          Flag as Suspicious
        </Button>
      </CardFooter>
    </Card>
  )
}

const recentReports = [
  {
    id: 1,
    title: "Trek FX 3 Disc - Matte Black",
    type: "bike",
    location: "Williamsburg, Brooklyn",
    date: "Today, 2:30 PM",
    reward: 100,
    image: "/placeholder.svg?height=96&width=96",
  },
  {
    id: 2,
    title: "Specialized Turbo Vado SL",
    type: "e-bike",
    location: "Prospect Park, Brooklyn",
    date: "Yesterday, 8:15 AM",
    reward: 250,
    image: "/placeholder.svg?height=96&width=96",
  },
  {
    id: 3,
    title: "Segway Ninebot MAX",
    type: "scooter",
    location: "DUMBO, Brooklyn",
    date: "May 10, 5:45 PM",
    reward: 50,
    image: "/placeholder.svg?height=96&width=96",
  },
  {
    id: 4,
    title: "Cannondale Topstone Carbon",
    type: "bike",
    location: "Fort Greene, Brooklyn",
    date: "May 9, 12:30 PM",
    reward: 150,
    image: "/placeholder.svg?height=96&width=96",
  },
]

const marketplaceListings = [
  {
    id: 1,
    title: "Trek FX 3 Disc - Like New",
    price: 450,
    location: "Bushwick, Brooklyn",
    platform: "Facebook Marketplace",
    date: "Posted 2 hours ago",
    suspicious: true,
    image: "/placeholder.svg?height=192&width=192",
  },
  {
    id: 2,
    title: "Specialized Rockhopper",
    price: 350,
    location: "Bed-Stuy, Brooklyn",
    platform: "Craigslist",
    date: "Posted 5 hours ago",
    suspicious: false,
    image: "/placeholder.svg?height=192&width=192",
  },
  {
    id: 3,
    title: "Segway Ninebot ES4",
    price: 275,
    location: "Park Slope, Brooklyn",
    platform: "OfferUp",
    date: "Posted yesterday",
    suspicious: true,
    image: "/placeholder.svg?height=192&width=192",
  },
  {
    id: 4,
    title: "Giant Escape 3",
    price: 320,
    location: "Crown Heights, Brooklyn",
    platform: "Facebook Marketplace",
    date: "Posted yesterday",
    suspicious: false,
    image: "/placeholder.svg?height=192&width=192",
  },
]
