"use client";
import { useTranslation } from "@wac/app/i18n/client";
import AnimatedText from "../components/animatedText/AnimatedText";
import { useState } from "react";


interface PropsType {
    params: { lng: string };
}

export default function signIn({ params: { lng } }: PropsType) {
    const { t } = useTranslation(lng, "signIn");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function login(){
        //Save email on local storage
        if (!email || !password) {
            alert("Please fill all fields");
            return;
        }
        localStorage.setItem("email", email);
        localStorage.setItem("isAuthenticated", "true");
        window.location.href = '/';
    }

    return (
        <>
            <AnimatedText
                text={t("title")}
                className="mb-16 mt-8 text-center text-green2 lg:text-7xl sm:text-6xl xs:text-4xl sm:px-24 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
            />
            <div className="flex flex-col items-center justify-center">
                <div className="w-full justify-center items-center max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8  drop-shadow-2xl">
                    <div className="space-y-6">
                        <h5 className="text-xl font-medium text-gray-900 ">{t("subtitle")}</h5>
                        <div>
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 ">{t("email")}</label>
                            <input type="email" name="email" id="email" onChange={(e) => setEmail(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="name@company.com" required />
                        </div>
                        <div>
                            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 ">{t("password")}</label>
                            <input type="password" name="password" id="password" placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " required />
                        </div>
                        <div className="flex items-start">
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input id="remember" type="checkbox" value="" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 " />
                                </div>
                                <label htmlFor="remember" className="ml-2 text-sm font-medium text-gray-900 ">{t("remember")}</label>
                            </div>
                            <a href="#" className="ml-auto text-sm text-blue-700 hover:underline ">{t("lostPassword")}</a>
                        </div>
                        <button onClick={login} className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ">{t("loginToYourAccount")}</button>
                        <div className="text-sm font-medium text-gray-500">
                            {t("notRegistered")} <a href="/sign-up" className="text-blue-700 hover:underline ">{t("createAccount")}</a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}