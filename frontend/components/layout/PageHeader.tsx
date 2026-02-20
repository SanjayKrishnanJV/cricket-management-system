interface PageHeaderProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ icon, title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {icon && <span className="text-4xl">{icon}</span>}
            {title}
          </h1>
          {description && (
            <p className="text-gray-600 mt-2">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
