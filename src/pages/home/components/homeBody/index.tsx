import React from "react";
import globalStyle from "@/constants/globalStyle";
import Operations from "../operations";
import Sheets from "./sheets";
import {ScrollView} from "react-native-gesture-handler";
import NavBar from "@/pages/home/components/navBar";

export default function HomeBody() {
    return (
        <>
            <NavBar/>
            <ScrollView
                style={globalStyle.fwflex1}
                showsVerticalScrollIndicator={false}>
                <Operations/>
                <Sheets/>
            </ScrollView>
        </>
    );
}
