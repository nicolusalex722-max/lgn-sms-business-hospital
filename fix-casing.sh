#!/bin/bash
fix() {
  local correct="$1"
  local found
  found=$(find ./components ./lib -iname "$(basename "$correct")" -not -path "*/node_modules/*" 2>/dev/null | head -n 1)
  if [ -n "$found" ] && [ "$found" != "$correct" ]; then
    mkdir -p "$(dirname "$correct")"
    mv "$found" "$correct"
    echo "renamed: $found -> $correct"
  elif [ -n "$found" ]; then
    echo "already correct: $found"
  else
    echo "not found (skip): $correct"
  fi
}

fix "./components/dashboard/StatCard.tsx"
fix "./components/dashboard/QuickAccessCard.tsx"
fix "./components/dashboard/Sidebar.tsx"
fix "./components/dashboard/Modal.tsx"
fix "./components/dashboard/SubscriptionForm.tsx"
fix "./components/dashboard/SubscriptionTable.tsx"
fix "./components/dashboard/SubscriptionToolbar.tsx"
fix "./components/dashboard/StatusBadge.tsx"
fix "./components/dashboard/StatusFilterDropdown.tsx"
fix "./components/dashboard/Pagination.tsx"
fix "./components/dashboard/BusinessCharts.tsx"
fix "./components/dashboard/Charts.tsx"
fix "./components/dashboard/SchoolStatCards.tsx"
fix "./components/dashboard/FeeDetailsTable.tsx"
fix "./components/dashboard/TopPerformersTable.tsx"
fix "./components/dashboard/EventsCalendar.tsx"
fix "./components/dashboard/AttendanceDonut.tsx"
fix "./components/dashboard/BusinessDashboardView.tsx"
fix "./components/dashboard/SchoolDashboardView.tsx"
fix "./components/dashboard/DashboardShell.tsx"
fix "./lib/clientType.ts"
