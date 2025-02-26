import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Navbar from '../../components/navbar'
import Button from '../../components/button'
import Card from '../../components/card'
import Dashboard from './dashboard'
export default function Admin() {
    return (
        <>
            <div>
                <Navbar/>
                <Dashboard/>
            </div>
        </>
    )
}
