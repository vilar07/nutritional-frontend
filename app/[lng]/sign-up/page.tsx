"use client";
import { useTranslation } from "@wac/app/i18n/client";
import AnimatedText from "../components/animatedText/AnimatedText";
import { useState } from "react";
import axios from "axios";
import { data } from "jquery";


interface PropsType {
    params: { lng: string };
}

export default function signUp({ params: { lng } }: PropsType) {
    const { t } = useTranslation(lng, "signUp");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [username, setUsername] = useState("");

    async function createAccount(){
        //Save email on local storage
        if (!email || !password || !confirmPassword || !username) {
            alert("Please fill all fields");
            return;
        }
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        const data = {
            username: username,
            email: email,
        }

        axios.post(`http://localhost:4000/users`, data)
            .then((response) => {
                console.log("Response:", response.data.data);
                window.location.href = '/sign-in';
            })
            .catch((error) => {
                console.log("Erro:", error);
            })
          
    }

    return (
        <>
            <AnimatedText
            text={"Sign Up"}
            className="mb-16 mt-8 text-center text-green2 lg:text-7xl sm:text-6xl xs:text-4xl sm:px-24 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
            />
            <div className="flex flex-col items-center justify-center">
                <div className="w-full bg-white rounded-lg md:mt-0 sm:max-w-md xl:p-0 shadow-2xl ">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h5 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
                            {t("title")}
                        </h5>
                            <div>
                                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900 ">Username</label>
                                <input type="name" name="username" id="username" onChange={(e) => setUsername(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="username" required />
                            </div>
                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 ">{t("email")}</label>
                                <input type="email" name="email" id="email" onChange={(e) => setEmail(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="name@company.com" required />
                            </div>
                            <div>
                            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 ">{t("password")}</label>
                                <input type="password" name="password" id="password" placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " required />
                            </div>
                            <div>
                            <label htmlFor="password-confirm" className="block mb-2 text-sm font-medium text-gray-900 ">{t("password_confirmation")}</label>
                                <input type="password" name="password-confirm" id="password" placeholder="••••••••" onChange={(e) => setConfirmPassword(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " required />
                            </div>
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input id="terms" aria-describedby="terms" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 " />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="terms" className="font-light text-gray-500">{t("accept")} <a className="font-medium text-primary-600 hover:underline " href="#">{t("terms")}</a></label>
                                </div>
                            </div>
                            <button onClick={createAccount} className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ">{t("createAccount")}</button>
                            <p className="text-sm font-light text-gray-500">
                            {t("already")} <a href="/sig-in" className="font-medium text-primary-600 hover:underline text-blue-500">{t("login")}</a>
                            </p>
                    </div>
                </div>
            </div>
        </>
    );
}