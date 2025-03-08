// src/pages/Home.tsx
import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { PostFeed } from "../components/post-feed";
import { NewPostForm } from "../components/new-post-form";
import { SearchBar } from "../components/search-bar";

export const Home: React.FC = () => {
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view") || "all";
  const searchQuery = searchParams.get("q") || "";

  if (
    view !== "all" &&
    view !== "following" &&
    view !== "search" &&
    !searchQuery
  ) {
    window.location.href = "/?view=all";
    return null;
  }

  return (
    <main className="container max-w-2xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-300">Posterr</h1>
        <SearchBar />
      </div>

      <NewPostForm />

      <Tabs defaultValue={searchQuery ? "search" : view} className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="glass flex w-full max-w-xs space-x-2 p-1">
            <TabsTrigger
              value="all"
              className="flex-1 rounded-md data-[state=active]:bg-blue-600"
              asChild
            >
              <Link to="/?view=all">All</Link>
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="flex-1 rounded-md data-[state=active]:bg-blue-600"
              asChild
            >
              <Link to="/?view=following">Following</Link>
            </TabsTrigger>
            {searchQuery && (
              <TabsTrigger
                value="search"
                className="flex-1 rounded-md data-[state=active]:bg-blue-600"
                asChild
              >
                <Link to={`/?view=search&q=${encodeURIComponent(searchQuery)}`}>
                  Search
                </Link>
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="all">
          <PostFeed filter="all" />
        </TabsContent>

        <TabsContent value="following">
          <PostFeed filter="following" />
        </TabsContent>

        <TabsContent value="search">
          {searchQuery ? (
            <>
              <h2 className="text-xl font-semibold mb-4 text-blue-300">
                Search results for:{" "}
                <span className="font-normal">{searchQuery}</span>
              </h2>
              <PostFeed filter="search" searchQuery={searchQuery} />
            </>
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              Enter a search term to find posts
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
};
