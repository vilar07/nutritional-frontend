"use client";
import Link from "next/link";
import { useTranslation } from "@wac/app/i18n/client";
import Image from "next/image";
import Logowc from"../../../../public/images/logoLarge.svg";
import { FaUserAlt } from "react-icons/fa";
import { Menubar } from 'primereact/menubar';
import LanguageChanger from "./LanguageChanger";
import { useState, useEffect } from "react";
import { MenuItem } from 'primereact/menuitem';

interface PropsType {
    lng: string;
}

const Navbar = ({ lng }: PropsType) => {
    const { t } = useTranslation(lng, "common");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const items = [
        {
            label: 'User',
            icon: 'pi pi-fw pi-user',
            className: 'bg-gray-300 border-2 rounded-xl',
            items: [
                {
                    label: 'Profile',
                    icon: 'pi pi-user',
                    // url: '/',
                },
                {
                    label: 'Sign Out',
                    icon: 'pi pi-power-off',
                    command: () => handleSignOut(),
                }
            ]
        }
    ];
    const itemsAdmin = [
        {
            label: 'User',
            icon: 'pi pi-fw pi-user',
            className: 'w-full bg-gray-300 border-2 rounded-xl',
            expanded: true,
            visible: true,
            items: [
                {
                    label: 'Admin Interface',
                    icon: 'pi pi-cog',
                    url: '/nutritional-interface',
                },
                {
                    label: 'Sign Out',
                    icon: 'pi pi-power-off',
                    command: () => handleSignOut(),
                }
            ]
        }
    ];

    const items2: MenuItem[] = [
        {
            label: 'Services',
            url: '/',
            id: 'services', 
            expanded: true,
        },
        {
            label: 'Recipes',
            url: 'https://wishandcook.com/pt/recipes',
            expanded: true,
            id: 'recipes', // Unique key for the Articles menu item
        },
        {
            label: 'Objects',
            id: 'objects',
            expanded: true,
            visible: true,
            items: [
                {
                    label: 'Articles',
                    icon: 'pi pi-book',
                    url: '/articles',
                },
                {
                    label: 'Calculators',
                    icon: 'pi pi-calculator',
                    url: '/calculators',
                },
                {
                    label: 'Carousels',
                    icon: 'pi pi-images',
                },
                {
                    label: 'Meal Cards',
                    icon: 'pi pi-file',
                }
            ]
        },
    ];
    
    useEffect(() => {
        const email = localStorage.getItem("email");
        const isAuthenticated = localStorage.getItem("isAuthenticated");
        console.log(localStorage);
        if(email && isAuthenticated){
            setIsAuthenticated(true);
            // Split the email address by '@' symbol
            const parts = email.split('@');
            // Check if the first part is 'admin'
            if (parts[0] === "admin") {
                setIsAdmin(true);
                localStorage.setItem("isAdmin", "true");
            } else {
                setIsAdmin(false);
                localStorage.setItem("isAdmin", "false");
            }
        } else {
            setIsAuthenticated(false);
            localStorage.removeItem("isAdmin");
            localStorage.removeItem("email");
            localStorage.removeItem("isAuthenticated");
        }
    });

    

    async function handleSignOut(){
        localStorage.removeItem("email");
        localStorage.removeItem("isAuthenticated");
        window.location.href = '/sign-in';
    }

    return (
        <nav className="w-full bg-gray-100 grid grid-cols-3 gap-0 shadow-xl rounded p-4">
            <a className="w-full flex items-center justify-start" href="/">
                <Image
                    className='hover:scale-125'
                    src={Logowc}
                    width={200}
                    priority={true}
                    alt="Wish and Cook"
                />
            </a>
            <div className="w-full flex items-center justify-center">
                <Menubar model={items2}  className=" bg-gray-100 w-full flex justify-center items-center"  />
            </div>
            <div className="w-full flex flex-row items-center justify-end">
                {isAuthenticated ? (
                    <>
                        {/* Check if the user is admin */}
                        {isAdmin ? (
                            <Menubar  model={itemsAdmin}  className=" bg-gray-100 w-full lg:justify-end text-center flex justify-center items-center" menuIcon="pi pi-user"/>
                        ) : (
                            <Menubar  model={items} className=" bg-gray-100 w-full lg:justify-end text-center flex justify-center items-center" menuIcon="pi pi-user"/>
                        )}
                        <div className="hidden lg:block">
                            <LanguageChanger locale={lng}  />
                        </div>
                    </>
                ) : (
                    <>
                        <a href="/sign-in">
                            <button className="hidden lg:inline-block lg:ml-auto lg:mr-3 py-2 px-6 bg-gray-300 hover:bg-gray-100 text-sm text-gray-900 font-bold rounded-xl transition duration-200">
                                Sign In
                            </button>
                        </a>
                        <div className="hidden ">
                            <LanguageChanger locale={lng}  />
                        </div>
                        
                    </>
                )}
            </div>
	    </nav>
    );
};

export default Navbar;
