export default function InfoCards() {
  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="container p-2 px-6 mx-auto">
        <div className="mt-2">
          <span className="inline-block w-40 h-1 bg-primary rounded-full"></span>
          <span className="inline-block w-3 h-1 ml-1 bg-primary rounded-full"></span>
          <span className="inline-block w-1 h-1 ml-1 bg-primary rounded-full"></span>
        </div>

        <div className="mt-8 xl:mt-8 lg:flex lg:items-center ">
          <div className="grid w-full grid-cols-1 gap-8 lg:w-full xl:gap-16 md:grid-cols-3">
            <div className="space-y-3">
              <span className="inline-block p-3 text-orange-500 bg-orange-100 rounded-xl  dark:bg-orange-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </span>

              <h1 className="text-xl font-semibold text-black capitalize ">
                Are you an urban planner?
              </h1>

              <p className="text-muted-foreground text-base dark:text-gray-300">
                Our platform makes your job easier by providing precise,
                satellite-based analysis for any location. Join us today to
                streamline your planning process and design smarter, greener
                cities with confidence. Whether you're designing new buildings
                or retrofitting existing ones, we provide actionable insights to
                enhance sustainability, and energy efficiency.
              </p>
            </div>

            <div className="space-y-3">
              <span className="inline-block p-3 text-orange-500 bg-orange-100 rounded-xl  dark:bg-orange-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
                  />
                </svg>
              </span>

              <h1 className="text-xl font-semibold text-black capitalize ">
                What We Offer
              </h1>

              <p className="text-muted-foreground text-base">
                Our platform is tailored for urban planners, architects,
                developers, and property owners aiming to mitigate Urban Heat
                Island (UHI) effects. Leveraging advanced satellite imagery, we
                deliver detailed analyses of temperature hotspots around your
                location and offer practical solutions to reduce heat retention.
              </p>
            </div>

            <div className="space-y-3">
              <span className="inline-block p-3 text-orange-500 bg-orange-100 rounded-xl  dark:bg-orange-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                  />
                </svg>
              </span>

              <h1 className="text-xl font-semibold text-black capitalize ">
                How It Works
              </h1>

              <p className="text-muted-foreground text-base">
                Enter any location to view an interactive heat map. Our AI
                chatbot offers personalized advice on reducing urban heat. Get
                tailored recommendations for building designs and green
                initiatives to cool your city and boost energy efficiency.
                Explore scenarios to visualize potential temperature impacts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
