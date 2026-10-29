import { useState } from "react";
import { useUserProjectsQuery } from "./queries/use-project.queries";

/**
 * Custom hook to manage user projects pagination, status filter, and queries.
 */
export function useProjectPagination(
  username: string,
  limit: number = 10,
  initialStatus?: string
) {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    initialStatus
  );

  const { data, isLoading, isFetching, error, refetch } = useUserProjectsQuery(
    username,
    {
      page: currentPage,
      limit,
      status: statusFilter,
    }
  );

  const totalCount = data?.total ?? 0;
  const totalPages = data?.totalPages ?? Math.ceil(totalCount / limit) ?? 1;
  const items = data?.projects ?? [];
  const isOwner = data?.isOwner ?? false;

  const handleStatusChange = (newStatus?: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  return {
    items,
    isLoading,
    isFetching,
    error,
    refetch,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    isOwner,
    statusFilter,
    setStatusFilter: handleStatusChange,
  };
}
