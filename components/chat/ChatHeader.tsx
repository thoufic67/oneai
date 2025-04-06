import { Link } from "@heroui/link";

export function ChatHeader() {
  return (
    <div className="flex justify-between items-center">
      <div className="text-sm">
        <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          Free plan
        </span>
        <Link href="#" className="text-primary ml-2">
          Upgrade
        </Link>
      </div>
    </div>
  );
}
