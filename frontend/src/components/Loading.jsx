const Loading = ({ fullScreen = false }) => {
  const content = (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return <div className="py-8">{content}</div>;
};

export default Loading;
