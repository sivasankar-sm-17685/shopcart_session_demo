interface PageLoaderProps {
  message?: string;
}

function PageLoader({ message = 'Loading...' }: PageLoaderProps) {
  return (
    <div className='page-loader'>
      <span className='page-loader-spinner' aria-hidden='true' />
      <p>{message}</p>
    </div>
  );
}

export default PageLoader;
