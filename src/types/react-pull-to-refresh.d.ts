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

  // Changed from 'export default' to 'export const'
  export const PullToRefresh: React.FC<PullToRefreshProps>;
}