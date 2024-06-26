import { ModalForm } from "@/components/modal/ModalForm";
import axios from "axios";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import API_URL from "../config";


const TambahPrinciple = ({ idModal, fetchData }) => {
    // console.log(errorMessages);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        nama_instansi: "",
    });

    const handleSubmit = async (e) => {
        // e.preventDefault();
        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("nama_instansi", formData.nama_instansi);

            const response = await axios.post(
                API_URL + "/principle",
                formDataToSend, // Kirim FormData
                {
                    headers: {
                        "Content-Type": "application/json",
                        // "Content-Type": "multipart/form-data",
                        // Tidak perlu menentukan 'Content-Type', axios akan menanganinya
                    },
                },
            );

            if (response.status === 200) {
                showToastMessage("Data berhasil ditambahkan!");
                
                const modalTambah = document.getElementById(idModal);
                if(modalTambah instanceof HTMLDialogElement){
                    modalTambah.close();
                }
                
                setFormData({
                    nama_instansi: "",
                });

                setLoading(false);
                fetchData();
            } else {
                console.error("Gagal mengirim data.");
            }
        } catch (error) {
            console.error("Error:", error.response.data.message);
            showErrorMessage(error.response.data.message);
            setTimeout(() => {
                setLoading(false);
            }, 5000);
        }
    };

    const showToastMessage = (message: string) => {
        toast.success(message, {
            position: "top-right",
        });
    };
    const showErrorMessage = (message: string) => {
        toast.error(message, {
            position: "top-right",
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const dataModal = {
        idModal: idModal,
        title: [
            <label
                key={"title"}
                className="flex gap-1 items-center font-semibold"
            >
                {/* <IconUserPlus color="#4777F3" /> */}
                Tambah Data Principle
            </label>,
        ],
        body: [
            <div key={"input"} className="flex flex-col gap-3">
                <div className="">
                    <label htmlFor="">Nama Instansi :</label>
                    <input
                        type="text"
                        name="nama_instansi"
                        id="nama_instansi"
                        value={formData.nama_instansi}
                        onChange={handleChange}
                        className="border w-full rounded-md p-2 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                </div>
            </div>,
        ],
        footer: [
            <>
                <button className="mt-3 inline-flex w-full justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-base font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm">
                    Cancel    
                </button>
                <button
                    key="buttonSubmit"
                    className={`ml-3 rounded bg-blue-700 px-8 py-2 text-sm text-white transition duration-150 ease-in-out hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2 ${loading ? "cursor-not-allowed" : ""
                        }`}
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <span className="animate-spin">&#9696;</span>
                    ) : (
                        ''                        
                    )}
                    {loading ? "Loading..." : "Submit"}
                </button>
            </>
        ],
    };

    return (
        <div>
            <ModalForm dataModal={dataModal} />
        </div>
    );
};

export default TambahPrinciple;
