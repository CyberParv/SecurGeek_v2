import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Home, ArrowLeft, Shield } from 'lucide-react'

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found - SecurGeek</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mb-4">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
                404
              </h1>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Page Not Found
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors"
              >
                <Home className="h-5 w-5" />
                <span>Go Home</span>
              </Link>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center space-x-2 border-2 border-primary-500 text-primary-600 dark:text-primary-400 px-6 py-3 rounded-lg hover:bg-primary-500 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Go Back</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default NotFound