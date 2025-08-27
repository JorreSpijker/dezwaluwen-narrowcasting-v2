import Link from 'next/link'
import { 
  ChartBarIcon, 
  CalendarIcon, 
  NewspaperIcon, 
  CogIcon 
} from '@heroicons/react/24/outline'

export default function Home() {
  const dashboardItems = [
    {
      name: 'Standen',
      description: 'Actuele competitiestanden per poule',
      href: '/standen',
      icon: ChartBarIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Programma',
      description: 'Uitslagen en aankomende wedstrijden',
      href: '/programma',
      icon: CalendarIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Nieuws',
      description: 'Laatste nieuws en mededelingen',
      href: '/nieuws',
      icon: NewspaperIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'Instellingen',
      description: 'Beheer instellingen en configuratie',
      href: '/instellingen',
      icon: CogIcon,
      color: 'bg-gray-500',
    },
  ]

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Zwaluwen Narrowcasting
        </h1>
        <p className="text-xl text-gray-600">
          Korfbal informatie systeem
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="group relative rounded-lg p-6 bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <div>
              <span className={`rounded-lg inline-flex p-3 ${item.color} text-white group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-600">
                <span className="absolute inset-0" aria-hidden="true" />
                {item.name}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
