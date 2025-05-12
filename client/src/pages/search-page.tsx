import React, { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SearchResultCard } from "@/components/bikes/SearchResultCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { BikeSearch } from "@shared/schema";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";

// Search form schema
const searchFormSchema = z.object({
  searchQuery: z.string().optional(),
  searchType: z.string().optional(),
  searchBrand: z.string().optional(),
  searchColor: z.string().optional(),
  searchLocationCity: z.string().optional(),
  searchDateRange: z.string().optional(),
  searchStatus: z.string().default("stolen"),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

export default function SearchPage() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Initialize form
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      searchQuery: "",
      searchType: "",
      searchBrand: "",
      searchColor: "",
      searchLocationCity: "",
      searchDateRange: "",
      searchStatus: "stolen",
    },
  });

  // Prepare search params from form values
  const searchParams = new URLSearchParams();
  Object.entries(form.getValues()).forEach(([key, value]) => {
    if (value) searchParams.append(key, value);
  });
  searchParams.append("page", currentPage.toString());
  searchParams.append("limit", itemsPerPage.toString());

  // Fetch search results
  const { data, isLoading } = useQuery<{ results: BikeSearch[], total: number }>({
    queryKey: [`/api/search?${searchParams.toString()}`],
    enabled: !!searchParams.toString(),
  });

  const searchResults = data?.results || [];
  const totalResults = data?.total || 0;
  const totalPages = Math.ceil(totalResults / itemsPerPage);

  const onSubmit = (values: SearchFormValues) => {
    // Reset to first page when submitting a new search
    setCurrentPage(1);
  };

  const toggleAdvancedSearch = () => {
    setShowAdvanced(!showAdvanced);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Generate pagination items
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const paginationItems = [];
    
    // Previous page button
    paginationItems.push(
      <button 
        key="prev" 
        type="button"
        onClick={() => handlePageChange(currentPage - 1)}
        className={`inline-flex items-center px-3 py-2 rounded-r-md border border-neutral-light bg-white text-muted-foreground hover:bg-neutral-lighter ${currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}`}
        disabled={currentPage === 1}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    );

    // Page numbers
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationItems.push(
        <button 
          key={i} 
          type="button"
          onClick={() => handlePageChange(i)}
          className={`inline-flex items-center px-4 py-2 border border-neutral-light ${
            i === currentPage 
              ? 'bg-primary text-white' 
              : 'bg-white text-muted-foreground hover:bg-neutral-lighter'
          }`}
          aria-current={i === currentPage ? 'page' : undefined}
        >
          {i}
        </button>
      );
    }

    // Next page button
    paginationItems.push(
      <button 
        key="next" 
        type="button"
        onClick={() => handlePageChange(currentPage + 1)}
        className={`inline-flex items-center px-3 py-2 rounded-l-md border border-neutral-light bg-white text-muted-foreground hover:bg-neutral-lighter ${currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''}`}
        disabled={currentPage === totalPages}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
    );

    return (
      <div className="flex justify-center mt-6">
        <nav className="inline-flex rounded-md shadow">
          {paginationItems}
        </nav>
      </div>
    );
  };

  return (
    <>
      <MobileHeader 
        title="חיפוש אופניים" 
        toggleMobileMenu={() => setIsMobileMenuOpen(true)} 
      />
      <DesktopSidebar activeRoute={location} />
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        activeRoute={location} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      <main className="pt-16 md:pt-0 md:pr-64 min-h-screen pb-20 md:pb-0">
        <section className="p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">חיפוש אופניים</h2>
            
            <div className="bg-card rounded-lg shadow p-6 border border-border mb-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <FormField
                      control={form.control}
                      name="searchQuery"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="חפש לפי יצרן, דגם, מספר שלדה או צבע" 
                                className="w-full p-3 pl-10" 
                                {...field} 
                              />
                              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="bg-primary text-white whitespace-nowrap">
                      חפש
                    </Button>
                  </div>
                  
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="link"
                      className="text-primary text-sm font-medium p-0 h-auto"
                      onClick={toggleAdvancedSearch}
                    >
                      <span>חיפוש מתקדם</span>
                      {showAdvanced ? (
                        <ChevronUp className="mr-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="mr-1 h-4 w-4" />
                      )}
                    </Button>
                    
                    {showAdvanced && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="searchType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-muted-foreground text-sm">סוג אופניים</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="כל הסוגים" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">כל הסוגים</SelectItem>
                                  <SelectItem value="road">אופני כביש</SelectItem>
                                  <SelectItem value="mountain">אופני הרים</SelectItem>
                                  <SelectItem value="hybrid">אופני היברידיים</SelectItem>
                                  <SelectItem value="electric">אופניים חשמליים</SelectItem>
                                  <SelectItem value="city">אופני עיר</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="searchBrand"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-muted-foreground text-sm">יצרן</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="כל היצרנים" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">כל היצרנים</SelectItem>
                                  <SelectItem value="trek">Trek</SelectItem>
                                  <SelectItem value="specialized">Specialized</SelectItem>
                                  <SelectItem value="giant">Giant</SelectItem>
                                  <SelectItem value="cannondale">Cannondale</SelectItem>
                                  <SelectItem value="other">אחר</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="searchColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-muted-foreground text-sm">צבע</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="כל הצבעים" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">כל הצבעים</SelectItem>
                                  <SelectItem value="black">שחור</SelectItem>
                                  <SelectItem value="white">לבן</SelectItem>
                                  <SelectItem value="red">אדום</SelectItem>
                                  <SelectItem value="blue">כחול</SelectItem>
                                  <SelectItem value="green">ירוק</SelectItem>
                                  <SelectItem value="yellow">צהוב</SelectItem>
                                  <SelectItem value="other">אחר</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="searchLocationCity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-muted-foreground text-sm">עיר</FormLabel>
                              <FormControl>
                                <Input placeholder="תל אביב, חיפה, ירושלים וכו׳" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="searchDateRange"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-muted-foreground text-sm">תאריך גניבה/מציאה</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="כל הזמנים" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">כל הזמנים</SelectItem>
                                  <SelectItem value="week">השבוע האחרון</SelectItem>
                                  <SelectItem value="month">החודש האחרון</SelectItem>
                                  <SelectItem value="3months">3 החודשים האחרונים</SelectItem>
                                  <SelectItem value="year">השנה האחרונה</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="searchStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-muted-foreground text-sm">סטטוס</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="סטטוס" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="all">הכל</SelectItem>
                                  <SelectItem value="stolen">נגנב</SelectItem>
                                  <SelectItem value="found">נמצא</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </form>
              </Form>
            </div>
            
            {/* Search Results */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">תוצאות חיפוש</h3>
                <div className="text-muted-foreground text-sm">
                  {isLoading ? "טוען..." : `נמצאו ${totalResults} אופניים`}
                </div>
              </div>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <i className="fas fa-spinner fa-spin text-primary text-2xl"></i>
                  <p className="mt-2 text-muted-foreground">מחפש אופניים...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <i className="fas fa-search text-muted-foreground text-4xl mb-3"></i>
                  <p className="text-muted-foreground mb-2">לא נמצאו תוצאות</p>
                  <p className="text-sm text-muted-foreground">נסה לשנות את הגדרות החיפוש שלך</p>
                </div>
              ) : (
                searchResults.map((result) => (
                  <SearchResultCard key={result.id} result={result} />
                ))
              )}
              
              {/* Pagination */}
              {renderPagination()}
            </div>
          </div>
        </section>
      </main>
      
      <MobileNavigation activeRoute={location} />
    </>
  );
}
