"use client";
import { useTranslation } from "@wac/app/i18n/client";
import AnimatedText from "../components/animatedText/AnimatedText";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import Slider from "react-slick";


interface PropsType {
    params: { lng: string };
}

export default function Carousels({ params: { lng } }: PropsType) {
    const { t } = useTranslation(lng, "home");


    const getCurrentSeason = () => {
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1; // Month index starts from 0
      
        if (month >= 3 && month <= 5) {
          return 'Spring';
        } else if (month >= 6 && month <= 8) {
          return 'Summer';
        } else if (month >= 9 && month <= 11) {
          return 'Autumn';
        } else {
          return 'Winter';
        }
      };
      
    const getCurrentTimeOfDay = () => {
        const currentHour = new Date().getHours();
        
        if (currentHour >= 6 && currentHour < 12) {
            return 'Morning';
        } else if (currentHour >= 12 && currentHour < 18) {
            return 'Afternoon';
        } else {
            return 'Night';
        }
    };
    
    function SampleNextArrow(props: any) {
        const { className, style, onClick } = props;
        return (
          <div
            className={className}
            style={{ ...style, display: "block", background: "gray",borderRadius: "50%" }}
            onClick={onClick}
          />
        );
    }
      
      function SamplePrevArrow(props: any) {
        const { className, style, onClick } = props;
        return (
          <div
            className={className}
            style={{ ...style, display: "block", background: "gray",borderRadius: "100%" }}
            onClick={onClick}
          />
        );
    }

    var settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        fade: true,
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />
    };

    const [email, setEmail] = useState("");
    const [filter, setFilter] = useState<any>("");
    const filterOptions = [
        {
            id: 1,
            name: "Recommended",
            value: "Recommended",
        }
    ];
    const [orderBy, setOrderBy] = useState<any>(null);
    const orderByOptions = [
        {
            id: 1,
            name: "Most Recent",
            value: "Most Recent",
        },
        {
            id: 2,
            name: "Most Popular",
            value: "Most Popular",
        },
        {
            id: 3,
            name: "Best Rated",
            value: "Best Rating",
        },
    ];

    useEffect(() => {
        const email = localStorage.getItem("email");
        const isAuthenticated = localStorage.getItem("isAuthenticated");
        if(email && isAuthenticated){
            setEmail(email);
        } 
    }, []);

    const [recommendedCharacteristics, setRecommendedCharacteristics] = useState([]);
    useEffect(() => {
        if (filter === "Recommended" && email) {
            axios.get(`http://localhost:4000/users/recommendations/${email}`) 
                .then((response) => {
                    console.log("Response recommended Characteristics:", response.data);
                    const characteristics = response.data.map((item: any) => item.trim());
                    setRecommendedCharacteristics(characteristics);

                })
                .catch((error) => {
                    console.log("Erro:", error);
                })
        } else if (filter === "Recommended" && !email) {
            // Alert that needs to be logged in to see recommended characteristics
            alert("Please log in to see recommended characteristics.");
            setFilter("");
        }
          
    }, [filter]);

    // Get carousels
    const [carousels, setCarousels] = useState<any[]>([]);
    useEffect(() => {
        let queryParams = "";
        if (orderBy) {
            queryParams += `order_by=${orderBy}`;
        }
        if (recommendedCharacteristics && recommendedCharacteristics.length > 0) {
            if (queryParams !== "") {
                queryParams += "&";
            }
            const encodedCharacteristics = encodeURIComponent(JSON.stringify(recommendedCharacteristics));
            queryParams += `recommendedCharacteristics=${encodedCharacteristics}`;
        }
    
        const url = queryParams !== "" 
            ? `http://localhost:4000/objects/carousels?${queryParams}`
            : `http://localhost:4000/objects/carousels`;
    
        console.log("url:", url)
        axios.get(url)
            .then((response) => {
                if (recommendedCharacteristics.length>0){
                    console.log("Response aqui:", response.data.carousels);
                    // setCarousels(response.data.carousels);
                    const filteredCarousels = response.data.carousels.filter((carousel: any) => {
                        // Filter carousels based on season and time of day relevance
                        const isRelevantSeason = carousel.season_relevance === 'All Year' || carousel.season_relevance === getCurrentSeason();
                        const isRelevantTimeOfDay = carousel.time_of_day_relevance === 'All Day' || carousel.time_of_day_relevance === getCurrentTimeOfDay();
                        return isRelevantSeason && isRelevantTimeOfDay;
                    });
                    setCarousels(filteredCarousels);
                } else if (orderBy) {
                    console.log("Response orderby:", response.data);
                    // setCarousels(response.data);
                    const filteredCarousels = response.data.filter((carousel: any) => {
                        // Filter carousels based on season and time of day relevance
                        const isRelevantSeason = carousel.season_relevance === 'All Year' || carousel.season_relevance === getCurrentSeason();
                        const isRelevantTimeOfDay = carousel.time_of_day_relevance === 'All Day' || carousel.time_of_day_relevance === getCurrentTimeOfDay();
                        return isRelevantSeason && isRelevantTimeOfDay;
                    });
                    setCarousels(filteredCarousels);
                }  else {
                    console.log("Response:", response.data);
                    // setCarousels(response.data);
                    const filteredCarousels = response.data.filter((carousel: any) => {
                        // Filter carousels based on season and time of day relevance
                        const isRelevantSeason = carousel.season_relevance === 'All Year' || carousel.season_relevance === getCurrentSeason();
                        const isRelevantTimeOfDay = carousel.time_of_day_relevance === 'All Day' || carousel.time_of_day_relevance === getCurrentTimeOfDay();
                        return isRelevantSeason && isRelevantTimeOfDay;
                    });
                    setCarousels(filteredCarousels);
                }
            })
            .catch((error) => {
                console.log("Error:", error);
                setCarousels([]);
            });
    }, [orderBy, recommendedCharacteristics]);

    return (
        <div  className="w-full grid grid-cols-1 gap-1">
            <AnimatedText
                text="Carousels"
                className="mb-8 mt-8 text-center text-green2 lg:text-7xl sm:text-6xl xs:text-4xl sm:px-24 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
            />
            <div className="w-full flex justify-start px-8">
                <div className="w-2/5 grid grid-cols-2 gap-2 ">
                    <Dropdown 
                        value={filter} 
                        onChange={(e) => setFilter(e.value)} 
                        options={filterOptions} 
                        optionLabel="name" 
                        placeholder="Filter By"
                        filter 
                        className="w-full h-12 border-2" 
                        panelClassName=' mt-1' 
                    />  
                    <Dropdown 
                        value={orderBy} 
                        onChange={(e) => setOrderBy(e.value)} 
                        options={orderByOptions} 
                        optionLabel="name" 
                        placeholder="Order By"
                        filter 
                        className="w-full h-12 border-2" 
                        panelClassName=' mt-1' 
                    />  
                </div>
            </div>
            {carousels.length > 0 ? (
    carousels.map((carousel: any) => (
        <div key={carousel.ID} className="w-full p-8">
            <Slider {...settings}>
                {carousel.items.map((item: any, itemIndex: any) => (
                    <div key={itemIndex} className="w-full grid grid-cols-5 gap-2 p-8">
                        <div className="w-full col-span-4 grid grid-cols-3 gap-2">
                            <div className="w-full">
                                <a className="w-full h-52" href={item.link}>
                                    <Image
                                        className='w-full h-52 object-cover object-center border-2 rounded-xl shadow-xl hover:scale-105'
                                        src={item.image}
                                        alt={'Carousel Image'}
                                        width={500}
                                        height={500}
                                        priority={true}
                                    />  
                                </a> 
                            </div> 
                            <div className="w-full col-span-2 grid grid-cols-2 gap-2 p-10">
                                <div className="w-full flex flex-col">
                                    <p className="w-full text-2xl font-bold">{item.title}</p>  
                                    <p className="w-full text-lg">{item.subtitle}</p>  
                                    <a href={item.link} className="w-full">
                                        <Button label={item.buttonText} className='w-2/3 mt-12 p-3 bg-gray-500 text-white hover:bg-white hover:text-gray-500 ' text raised/>
                                    </a>  
                                </div>
                                <div className="w-full">
                                    <div className="w-full mt-4" dangerouslySetInnerHTML={{ __html: item.description }} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>
            <hr className="mt-5" key={`${carousel.ID}-hr`} /> 
        </div>
    ))
) : (
    <p>No carousels found.</p>
)}
        </div>
    );
}
