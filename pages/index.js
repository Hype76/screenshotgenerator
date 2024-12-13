import Head from 'next/head'
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    // Import the script dynamically after component mounts
    const script = document.createElement('script')
    script.src = '/script.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <>
      <Head>
        <title>Website Screenshot Tool</title>
        <meta name="description" content="Capture full-page screenshots of any website" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      </Head>

      <div className="bg-gray-100 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Website Screenshot Tool</h1>
            <p className="text-gray-600">Capture full-page screenshots of any website</p>
          </header>

          <main className="max-w-3xl mx-auto">
            <form id="screenshotForm" className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="mb-4">
                <label htmlFor="url" className="block text-gray-700 font-medium mb-2">
                  Website URL
                </label>
                <input
                  type="text"
                  id="url"
                  name="url"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter website URL (e.g., pulseslabs.com)"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Capture Screenshot
              </button>
            </form>
            <div id="result" className="mt-8"></div>
          </main>
        </div>
      </div>
    </>
  )
} 