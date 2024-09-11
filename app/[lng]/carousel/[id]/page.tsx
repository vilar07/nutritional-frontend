"use client";
import { useTranslation } from "@wac/app/i18n/client";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Slider from "react-slick";


interface PropsType {
    params: { id: string; lng?: string }; // Making lng optional
}

export default function carousel({ params }: PropsType) {

    const { t } = useTranslation(params.lng || "", "signIn");
    const [carousel, setCarousel] = useState<any>({});
    const [imagesURLs, setImagesURLs] = useState<any>([]);


    useEffect(() => {
        try {
            axios.get(`http://localhost:4000/objects/carousel/${params.id}`)
                .then(response => {
                    console.log(response.data);
                    setCarousel(response.data);
                    const imagesArray = JSON.parse(response.data.images);
                    setImagesURLs(imagesArray);
                })
                .catch(error => {
                    console.log(error);
                });
        } catch (error) {
            console.log(error);
        }
    }, []);

    //Incrementing the views of the article
    const isMounted = useRef(false); // useRef to track if component has mounted
    useEffect(() => {
        if (!isMounted.current) {
            // Run only if component is mounted for the first time
            const fetchData = async () => {
                try {
                    const response = await axios.put(`http://localhost:4000/objects/views/carousel/${params.id}`);
                    console.log(response.data);
                } catch (error) {
                    console.log(error);
                }
            };

            fetchData();
            isMounted.current = true; // Update flag after initial render
        }
    }, [params.id]); // Only re-run effect if params.id changes

    const formatDescriptionHTML = (htmlString: any) => {
        // Regular expression to add list item numbers for ordered lists
        const regexOrderedList = /<li>(.*?)<\/li>/g;
        let matchOrderedList;
        let counter = 1;
        while ((matchOrderedList = regexOrderedList.exec(htmlString)) !== null) {
            // Check if the list is an ordered list
            if (/<ol>/g.test(matchOrderedList.input)) {
                // Replace the list item with the counter and the content
                htmlString = htmlString.replace(
                    matchOrderedList[0],
                    `<li>${counter}. ${matchOrderedList[1]}</li>`
                );
                counter++;
            } else {
                // If it's an unordered list, add a bullet point in front of the content
                htmlString = htmlString.replace(
                    matchOrderedList[0],
                    `<li>&#8226; ${matchOrderedList[1]}</li>`
                );
            }
        }
    
        // Replace blockquote with custom class to ensure correct styling
        htmlString = htmlString.replace(
            /<blockquote>/g,
            '<blockquote className="blockquote">'
        );
    
        // Replace pre elements with class ql-syntax to ensure correct styling
        htmlString = htmlString.replace(
            /<pre class="ql-syntax"(.*?)>(.*?)<\/pre>/g,
            '<pre className="ql-syntax" $1>$2</pre>'
        );
    
       // Regular expression to replace p elements with alignment classes
        htmlString = htmlString.replace(
            /<p class="ql-align-(justify|right|center)">(.*?)<\/p>/g,
            function (_match: any, alignment: string, content: string) {
                let alignmentClass = '';
                if (alignment === 'justify') {
                    alignmentClass = 'text-justify';
                } else if (alignment === 'right') {
                    alignmentClass = 'text-right';
                } else if (alignment === 'center') {
                    alignmentClass = 'text-center';
                }
                return `<div className="${alignmentClass}">${content}</div>`;
            }
        );

    
        // Replace span and strong elements with optional ql-size class or inline styles with appropriate font size
        htmlString = htmlString.replace(
            /<(span|strong)(?: class="ql-size-(huge|large|small)")?(?: style="(.*?)")?>(.*?)<\/(?:span|strong)>/g,
            function (_match: any, p1: any, p2: string, p3: string, p4: any) {
                let fontSize = '';
                let styles = p3 || '';
    
                if (p2 === 'huge') {
                    fontSize = '4rem';
                } else if (p2 === 'large') {
                    fontSize = '2rem';
                } else if (p2 === 'small') {
                    fontSize = '1rem';
                }
    
                // Check if color style is present, if not, add it
                if (!styles.includes('color')) {
                    styles += 'color: var(--tw-prose-bold);';
                }
    
                return `<${p1} style="font-size: ${fontSize}; ${styles}">${p4}</${p1}>`;
            }
        );
    
        return htmlString;
    };
        
    // Define a variable to hold the formatted description HTML
    let formattedDescriptionHTML = "";

    // Check if carousel.description is defined before calling formatDescriptionHTML
    if (carousel.description) {
        // Call formatDescriptionHTML and assign the result to the formattedDescriptionHTML variable
        formattedDescriptionHTML = formatDescriptionHTML(carousel.description);
    }

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
        prevArrow: <SamplePrevArrow />,
    };

    return (
        <>
            <div className="w-full grid grid-cols-1 gap-4 pt-16">
                <div className="w-full grid grid-cols-1 gap-4">
                    <div className="w-full flex items-center justify-center flex-col text-center">
                        <div className="w-full mb-4">
                            <h1 className="w-full text-6xl text-balance text-green2 font-bold">{carousel.title}</h1>
                        </div>
                        <div className="w-full text-lg text-black text-opacity-60">
                            <p>{carousel.subtitle}</p>
                        </div>
                    </div>
                    {imagesURLs && (
                        <div className="w-full flex items-center justify-center text-center ">
                            <div className="w-1/3 text-center ">
                                <Slider {...settings} >
                                    {imagesURLs.map((image: string, index: number) => (
                                        <div key={index} className='w-full bg-white border-4 border-gray-500 rounded-xl'>
                                            <Image
                                            className='w-full h-90 object-cover border-2 rounded-xl'
                                            src={image}
                                            alt={`${image} Image ${index + 1}`}
                                            width={600}
                                            height={600}
                                            priority
                                            />
                                        </div>
                                    ))}
                                </Slider>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="w-full grid grid-cols-1 gap-4 px-32 mt-24">
                <div className="w-full flex items-center justify-center text-left bg-gray-200 p-4 border-2 rounded-xl hover:scale-105">
                    <div className="w-full" dangerouslySetInnerHTML={{ __html: formattedDescriptionHTML }} />
                </div>
            </div>
        </>
    );
}