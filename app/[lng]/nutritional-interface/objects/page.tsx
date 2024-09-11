"use client";
import { useTranslation } from "@wac/app/i18n/client";
import AnimatedText from "../../components/animatedText/AnimatedText";
import { Menubar } from 'primereact/menubar';
import { MenuItem } from 'primereact/menuitem';
import Sidebar from "../../components/sidebar/Sidebar";
import { Button } from 'primereact/button';
import { TabMenu } from 'primereact/tabmenu';
import { Menu } from 'primereact/menu';
import { Toast } from 'primereact/toast';
import { useRef, useEffect } from "react";

interface PropsType {
    params: { lng: string };
}

export default function Objects({ params: { lng } }: PropsType) {
    const { t } = useTranslation(lng, "home");

    useEffect(() => {
        const isAdmin = localStorage.getItem("isAdmin");
        // If not Admin, alert and redirect to home
        if (isAdmin === "false") {
            alert("You are not an Admin.");
            window.location.href = "/";
        }
    }, []); // Empty dependency array ensures the effect runs only once

    const menuLeft = useRef<any>(null);
    const toast = useRef<Toast>(null);

    const items: MenuItem[] = [
        {
            label: 'Articles',
            icon: 'pi pi-book',
            url: '/nutritional-interface/objects/articles',
            id: 'articles', // Unique key for the Articles menu item
        },
        {
            label: 'Calculators',
            icon: 'pi pi-calculator',
            url: '/nutritional-interface/objects/calculators',
            id: 'calculators', 
        },
        {
            label: 'Carousels',
            icon: 'pi pi-images',
            url: '/nutritional-interface/objects/carousels',
            id: 'carousels',
        },
        {
            label: 'Meal Cards',
            icon: 'pi pi-file',
            url: '/nutritional-interface/objects/mealCards',
            id: 'meal-cards',
        }
    ];

    return (
        <div className="w-full flex">
            <div className="w-1/5 hidden md:flex">
                <Sidebar lng={lng} />
            </div>
            <div className="w-full md:w-4/5 flex flex-col mt-8">
                <div className="w-full flex items-center text-center justify-center md:hidden border-2 rounded-xl p-2 px-8">
                    <div className="w-full grid grid-cols-3 gap-0">
                        <a href="/nutritional-interface/objects" className="w-full flex justify-center bg-gray-200 hover:bg-gray-300 border-2 rounded-xl">
                            <h1>Objetcs</h1>
                        </a>
                        <a href="/nutritional-interface/characteristics" className="w-full flex justify-center bg-gray-200 hover:bg-gray-300 border-2 rounded-xl">
                            <h1>Characteristics</h1>
                        </a>
                        <a href="/nutritional-interface/reports" className="w-full flex justify-center bg-gray-200 hover:bg-gray-300 border-2 rounded-xl">
                            <h1>Reports</h1>
                        </a>
                    </div>
                </div>
                <AnimatedText
                text={"Objects"}
                className="mb-16  mt-8 text-center text-green2 text-4xl lg:text-7xl sm:text-6xl xs:text-4xl drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
                />
                <div className="w-full items-center justify-center hidden lg:flex">
                    <Menubar model={items} className="border-2 rounded-lg"  />
                </div>
                <div className="w-full px-8 items-center justify-center flex lg:hidden">
                <Toast ref={toast}></Toast>
                <Menu model={items} popup ref={menuLeft}  id="popup_menu_left" />
                <Button label="Show Objects" icon="pi pi-align-left" className="mr-2" onClick={(event) => menuLeft.current.toggle(event)} aria-controls="popup_menu_left" aria-haspopup />
            </div>
            </div>
        </div>
    );
}