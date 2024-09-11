"use client";
import { useTranslation } from "@wac/app/i18n/client";
import { Card, List, ListItem, ListItemPrefix, Typography } from "@material-tailwind/react";
import {PresentationChartBarIcon,ShoppingBagIcon, UserCircleIcon,InboxIcon} from "@heroicons/react/24/solid";

interface PropsType {
    lng?: string;
}

const Sidebar = ({ lng }: PropsType) => {
    

    return (
        <div className="w-full flex">
                <Card className="h-[calc(100vh-2rem)] w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5 mt-2 mb-2">
                    <div className="mb-2 p-4">
                        <Typography variant="h5" color="blue-gray">
                        Sidebar
                        </Typography>
                    </div>
                    <List className="space-y-4">
                        <a href="/nutritional-interface/objects">
                            <ListItem className="hover:bg-gray-300 p-4">
                            <ListItemPrefix>
                                <PresentationChartBarIcon className="h-5 w-5" />
                            </ListItemPrefix>
                            Objects
                            </ListItem>
                        </a>
                        <a href="/nutritional-interface/characteristics">
                            <ListItem className="hover:bg-gray-300 p-4">
                            <ListItemPrefix>
                                <InboxIcon className="h-5 w-5" />
                            </ListItemPrefix>
                            Characteristics
                            </ListItem>
                        </a>
                        <a href="/nutritional-interface/reports">
                            <ListItem className="hover:bg-gray-300 p-4">
                            <ListItemPrefix>
                                <UserCircleIcon className="h-5 w-5" />
                            </ListItemPrefix>
                            Reports
                            </ListItem>
                        </a>    
                    </List>
                </Card>
            </div>
    );
};

export default Sidebar;
