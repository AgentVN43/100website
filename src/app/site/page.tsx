"use client"; // Cần nếu đang dùng App Router

import React from "react";
import { Table } from "antd";
import type { TableProps } from "antd";
import { useRouter } from "next/navigation"; // Nếu dùng App Router

interface DataType {
    id: string;
    name: string;
    url: string;
    username: string;
    password: string;
    jsonFile: string;
    lastPostedIndex: number;
}

const Site: React.FC = () => {
    const router = useRouter();

    const columns: TableProps<DataType>["columns"] = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "URL",
            dataIndex: "url",
            key: "url",
            render: (text) => (
                <a href={text} target="_blank" rel="noopener noreferrer">
                    {text}
                </a>
            ),
        },
        {
            title: "Username",
            dataIndex: "username",
            key: "username",
        },
        {
            title: "Password",
            dataIndex: "password",
            key: "password",
        },
        {
            title: "JSON File",
            dataIndex: "jsonFile",
            key: "jsonFile",
        },
        {
            title: "Last Posted Index",
            dataIndex: "lastPostedIndex",
            key: "lastPostedIndex",
        },
    ];

    const data: DataType[] = [
        {
            id: "1",
            name: "Bep Tu Doi",
            url: "https://beptudoi.com",
            username: "annk.sale",
            password: "h3UtkQiSflWUSpC6k5nAoqBR",
            jsonFile: "beptudoi.json",
            lastPostedIndex: 6,
        },
        {
            id: "2",
            name: "Bep Duong Lam",
            url: "https://bepduonglam.vn",
            username: "bepduonglam@admin",
            password: "J8Iwm7500DPg1D3F4cDp7wA8",
            jsonFile: "bepduonglam.json",
            lastPostedIndex: 2,
        },
        {
            id: "3",
            name: "Bep 89",
            url: "https://bep89.com",
            username: "bep89@admin",
            password: "LpOJxlzqIvuCEOFZDkItZwdT",
            jsonFile: "bep89.json",
            lastPostedIndex: 1,
        },
    ];

    return (
        <Table<DataType>
            columns={columns}
            dataSource={data}
            onRow={(record) => ({
                onClick: () => router.push(`/site/${record.id}`), // Chuyển trang khi click vào row
                style: { cursor: "pointer" }, // Hiển thị trỏ chuột kiểu click
            })}
        />
    );
};

export default Site;
