import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Badge } from "@components/ui/badge";
import { cn } from "@components/ui/utils";

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const removeOption = (option: string) => {
    onChange(selected.filter((item) => item !== option));
  };

  const filteredOptions = options.filter((option) => {
    // Search in the display name part (after ':') if format is "ID:Name"
    const searchText = option.includes(':') 
      ? option.split(':').slice(1).join(':').toLowerCase()
      : option.toLowerCase();
    return searchText.includes(searchQuery.toLowerCase());
  });

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <div
        className={cn(
          "flex min-h-10 w-full rounded-md border border-green-200 bg-white px-3 py-2 text-sm cursor-pointer transition-colors",
          "hover:border-green-300 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-200",
          isOpen && "border-green-400 ring-2 ring-green-200"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selected.length === 0 ? (
            <span className="text-green-600/60">{placeholder}</span>
          ) : (
            selected.map((item) => {
              // Extract display name if format is "ID:Name", otherwise use item as-is
              const displayText = item.includes(':') ? item.split(':').slice(1).join(':') : item;
              return (
                <Badge
                  key={item}
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 pl-2 pr-1"
                >
                  {displayText}
                  <button
                    type="button"
                    className="ml-1 rounded-full hover:bg-green-200 p-0.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOption(item);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })
          )}
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 ml-2 text-green-600 transition-transform flex-shrink-0 self-center",
            isOpen && "transform rotate-180"
          )}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-green-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-green-100">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-green-200 rounded-md focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-200"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-48">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-green-600 text-center">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option}
                  className={cn(
                    "flex items-center px-3 py-2 cursor-pointer transition-colors hover:bg-green-50",
                    selected.includes(option) && "bg-green-50/50"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(option);
                  }}
                >
                  <div
                    className={cn(
                      "w-4 h-4 mr-2 rounded border flex items-center justify-center flex-shrink-0",
                      selected.includes(option)
                        ? "bg-green-600 border-green-600"
                        : "border-green-300"
                    )}
                  >
                    {selected.includes(option) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm text-green-800">
                    {option.includes(':') ? option.split(':').slice(1).join(':') : option}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
