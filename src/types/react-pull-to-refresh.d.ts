declare module 'react-pull-to-refresh' {
  import * as React from 'react';

  interface PullToRefreshProps {
    onRefresh: () => Promise<any> | void;
    children: React.ReactNode;
    disabled?: boolean;
    className?: string;
    icon?: React.ReactNode;
    loading?: React.ReactNode;
    resistance?: number;
    isRefreshing?: boolean;
  }

  // Reverted to default export
  const PullToRefresh: React.FC<PullToRefreshProps>;
  export default PullToRefresh;
}