const ErrorMessage = ({ children }: { children: string }) => (
  <span className="text-sm font-semibold text-red-500">{children}</span>
);

export default ErrorMessage;
