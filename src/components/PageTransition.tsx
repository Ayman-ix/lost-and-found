'use client';

import { usePathname } from 'next/navigation';

/**
 * PageTransition wraps every page's content.
 * Using `pathname` as the React key forces a remount on every route change,
 * which re-triggers the CSS enter animation defined in globals.css.
 */
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
