import {Card, Grid} from "@mui/material";
import React, {useEffect, useRef, useState} from "react";
import {ApplicationSubscriptionsEntity} from "@backend/ApplicationSubscriptionsEntity";
import SubscriptionCard from "./SubscriptionCard";
import {mapToSubscriptionCardAppAdmin} from "../model/GeneralSubscriptions";

export default function SubscriptionDragGrid({subscriptions, onEdit, onActivate, onDeactivate, onBuy, onSwap}:
                                                 {
                                                     subscriptions: ApplicationSubscriptionsEntity[];
                                                     onEdit: (id: string) => void;
                                                     onActivate: (id: string) => void;
                                                     onDeactivate: (id: string) => void;
                                                     onBuy: () => void;
                                                     onSwap: (subId: string, otherSudId: string) => void;
                                                 }) {

    const ANIM_MS = 300;

    const [items, setItems] = useState(subscriptions);
    const positionsRef = useRef({});
    const elementsRef = useRef({});

    const recordPositions = () => {
        items.forEach(item => {
            const el = elementsRef.current[item.id];
            if (el) positionsRef.current[item.id] = el.getBoundingClientRect();
        });
    };

    useEffect(() => {
        setItems(subscriptions);
    }, [subscriptions]);

    const playFLIP = () => {
        items.forEach(item => {
            const el = elementsRef.current[item.id];
            const last = el?.getBoundingClientRect();
            const first = positionsRef.current[item.id];

            if (!first || !last) return;

            const dx = first.left - last.left;
            const dy = first.top - last.top;

            el.style.transform = `translate(${dx}px, ${dy}px)`;
            el.style.transition = "none";

            requestAnimationFrame(() => {
                el.style.transform = "";
                el.style.transition = `transform ${ANIM_MS}ms ease`;
            });
        });
    };

    const move = (index: number, dir: "left" | "right") => {
        if (dir === "left" && index === 0) return;
        if (dir === "right" && index === items.length - 1) return;

        recordPositions();

        const item = items[index];

        const swapIdx = dir === "left" ? index - 1 : index + 1;
        onSwap(item.id, items[swapIdx].id);

        const newItems = [...items];
        [newItems[index], newItems[swapIdx]] = [newItems[swapIdx], newItems[index]];
        setItems(newItems);

        requestAnimationFrame(playFLIP);
    };

    return (
        <Card sx={{ p: 2, mt: 6, mb: 6 }}>
            <Grid container spacing={2} alignItems="stretch">
                {items.map((sub, index) => (
                    <Grid key={sub.id} item xs={6} md={4} display="flex">
                        <Card
                            ref={el => (elementsRef.current[sub.id] = el)}
                            sx={{position: "relative", border: 0, width: 1}}
                        >
                            <SubscriptionCard
                                {...mapToSubscriptionCardAppAdmin(
                                    sub,
                                    onEdit,
                                    onActivate,
                                    onDeactivate
                                )}
                                onBuy={onBuy}
                                isFirst={index === 0}
                                isLast={index === items.length - 1}
                                move={(direction) => move(index, direction)}
                            />
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Card>
    );

}