import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: number;
  icon: ReactNode;
  color: "primary" | "green" | "yellow" | "red";
};

export default function StatCard({ title, value, icon, color }: StatCardProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary":
        return "bg-primary-100";
      case "green":
        return "bg-green-100";
      case "yellow":
        return "bg-yellow-100";
      case "red":
        return "bg-red-100";
      default:
        return "bg-gray-100";
    }
  };
  
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", getColorClasses(color))}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
