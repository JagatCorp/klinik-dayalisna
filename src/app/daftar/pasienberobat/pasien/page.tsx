"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Head from "next/head";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import API_URL from "@/app/config";
import FormattedDate from "@/components/FormattedDate";
const Pasienberobat = () => {
  const [pasienberobat, setPasienberobat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef(null);
  const [fecthHariIni, setFecthHariIni] = useState([]);
  const [today, setToday] = useState<string>('');
  // update data
  const [updateData, setUpdateData] = useState<{
    keluhan: string;
    harga: string;
    status: string;
    gambar: any;
    id: string; // tambahkan properti 'id' ke tipe
  }>({
    keluhan: "",
    harga: "",
    status: "",
    gambar: null,
    id: "",
  });


  const fetchHariIni = async () => {
    try {
      const response = await axios.get(
        API_URL + `/transaksi_medis/pasien/${localStorage.getItem('id')}`,
      );
      const data = response.data.data;

      // Mendapatkan tanggal hari ini
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      // Filter data untuk mengambil data yang dibuat pada hari ini
      const filteredData = data.filter(item => {
        const itemDate = new Date(item.createdAt);
        return itemDate.toISOString().split('T')[0] === todayString;
      });

      console.log('pasienberobat', filteredData);
      setFecthHariIni(filteredData);
    } catch (error) {
      console.error("Error fetching data pasienberobat:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengambil data",
      );
    } finally {
      setLoading(false);
    }
  };



  const fetchData = async () => {
    try {
      const response = await axios.get(
        API_URL + `/transaksi_medis/pasien/${localStorage.getItem('id')}?page=${currentPage}`,
      );
      console.log('pasienberobat', response.data.data);
      setPasienberobat(response.data.data);
      setTotalPages(response.data.totalPages);
      setPageSize(response.data.pageSize);
      setTotalCount(response.data.totalCount);
    } catch (error: any) {
      // Menggunakan `any` untuk sementara agar bisa mengakses `message`
      console.error("Error fetching data pasienberobat:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengambil data",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchDataByKeyword = async (keyword: string) => {
    try {
      const response = await axios.get(
        API_URL + `/transaksi_medis?keyword=${keyword}`,
      );
      setPasienberobat(response.data.data.data);
      setTotalPages(response.data.totalPages);
      setPageSize(response.data.pageSize);
      setTotalCount(response.data.totalCount);
    } catch (error: any) {
      // Menggunakan `any` untuk sementara agar bisa mengakses `message`
      console.error("Error fetching data pasienberobat:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengambil data",
      );
    } finally {
      setLoading(false);
    }
  };

  // kondisi search
  useEffect(() => {
    fetchHariIni();
    // Mendapatkan tanggal hari ini
    const currentDate = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const todayString = currentDate.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    setToday(todayString);
    if (searchTerm !== "") {
      fetchDataByKeyword(searchTerm);
    } else {
      fetchData();
    }
  }, [currentPage, searchTerm]);

  //   toast
  const showToastMessage = (message: string) => {
    toast.success(message, {
      position: "top-right",
    });
  };

  if (error) {
    return <div className="text-red-500 text-center">Error: {error}</div>;
  }

  const firstPage = Math.max(1, currentPage - 4); // Menghitung halaman pertama yang akan ditampilkan

  // update data
  const handleEdit = (Item) => {
    console.log('Item', Item);
    setUpdateData({
      id: Item.id,
      keluhan: Item.keluhan,
      harga: Item.harga,
      status: Item.status,
      gambar: Item.null,
    });
    setShowUpdateModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const formDataToUpdate = new FormData();
      formDataToUpdate.append("keluhan", updateData.keluhan);
      formDataToUpdate.append("harga", updateData.harga);
      formDataToUpdate.append("status", updateData.status);
      // Cek jika ada file gambar yang baru atau tidak
      if (updateData.gambar && updateData.gambar instanceof File) {
        formDataToUpdate.append("gambar", updateData.gambar);
      } else {
        // Jika tidak ada gambar baru, tidak perlu menambahkan field 'gambar' ke FormData
        // Atau bisa menambahkan logika lain sesuai kebutuhan backend Anda
      }
      const response = await axios.put(
        API_URL + `/pasien/${updateData.id}`,
        formDataToUpdate, // Kirim FormData
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      console.log(response);
      if (response.status === 200) {
        showToastMessage("Data berhasil diupdate!");
        setShowUpdateModal(false);
        fetchData();
      } else {
        console.error("Gagal mengupdate data.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <DefaultLayout>
        <Breadcrumb pageName={"Pasien Berobat"} />
        <div className="flex flex-col gap-10">
          <ToastContainer />

          {/* Table berobat hari ini */}

          <div className="flex flex-col justify-center items-center -mt-10">
            <div
              className="relative flex max-w-[500px] h-[180px] w-full flex-col rounded-[10px] border-[1px] border-gray-200 bg-white dark:border-strokedark dark:bg-boxdark bg-clip-border shadow-md shadow-[#F3F3F3] dark:border-[#ffffff33] dark:!bg-navy-800 dark:text-white dark:shadow-none"
            >
              <div
                className="flex h-fit w-full items-center justify-between rounded-t-2xl bg-white border-stroke  dark:border-strokedark dark:bg-boxdark px-4 pb-[20px] pt-4 shadow-2xl shadow-gray-100 dark:shadow-slate-20"
              >
                <h4 className="text-lg font-bold text-navy-700 dark:text-white">
                  Riwayat hari ini
                </h4>
                <button
                  className="linear rounded-[20px] bg-lightPrimary px-4 py-2 text-base font-medium text-brand-500 transition duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:active:bg-white/20">
                  {today}
                </button>
              </div>
              <div className="w-full overflow-x-scroll px-4 md:overflow-x-hidden">
                <table role="table" className="w-full min-w-[500px] overflow-x-scroll">
                  <thead>
                    <tr role="row">
                      <th
                        colSpan={1}
                        role="columnheader"
                        title="Toggle SortBy"
                        className="cursor-pointer"
                      >
                        <div
                          className="flex items-center justify-between pb-2 pt-4 text-start uppercase tracking-wide text-gray-600 sm:text-xs lg:text-xs">
                          No Urut Antrian
                        </div>
                      </th>
                      {/* <th
                        colSpan={1}
                        role="columnheader"
                        title="Toggle SortBy"
                        className="cursor-pointer"
                      >
                        <div
                          className="flex items-center justify-between pb-2 pt-4 text-start uppercase tracking-wide text-gray-600 sm:text-xs lg:text-xs"
                        >
                          Keluhan
                        </div>
                      </th> */}
                      <th
                        colSpan={1}
                        role="columnheader"
                        title="Toggle SortBy"
                        className="cursor-pointer"
                      >
                        <div
                          className="flex items-center justify-between pb-2 pt-4 text-start uppercase tracking-wide text-gray-600 sm:text-xs lg:text-xs"
                        >
                          Status
                        </div>
                      </th>
                      <th
                        colSpan={1}
                        role="columnheader"
                        title="Toggle SortBy"
                        className="cursor-pointer"
                      >
                        <div
                          className="flex items-center justify-between pb-2 pt-4 text-start uppercase tracking-wide text-gray-600 sm:text-xs lg:text-xs"
                        >
                          Detail
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody role="rowgroup" className="px-4">
                    {fecthHariIni && fecthHariIni.length > 0 ? (
                      <>
                        {fecthHariIni.map((Item, key) => (
                          <>
                            <tr role="row">
                              <td className="py-3 text-sm" role="cell">
                                <div className="flex items-center gap-2">

                                  <p
                                    className="text-sm font-medium text-navy-700 dark:text-white"
                                  >
                                    {Item.no_urut}
                                  </p>
                                </div>
                              </td>
                              {/* <td className="py-3 text-sm" role="cell">
                                <p className="text-md font-medium text-gray-600 dark:text-white">
                                  {Item.keluhan}
                                </p>
                              </td> */}

                              <td className="py-3 text-sm" role="cell">
                                <p className="text-md font-medium text-gray-600 dark:text-white">
                                  {Item.status == '3' ? "Sudah Selesai" : (Item.status == '2' ? "Sedang Berobat" : (Item.status == '1' ? "Sudah Datang" : "Belum Datang"))}
                                </p>
                              </td>
                              <td className="py-3 text-sm" role="cell">
                                <p className="text-md font-medium text-gray-600 dark:text-white">
                                  <a href={`/daftar/pasienberobat/detail/${Item.id}`} className="hover:text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    </svg>
                                  </a>
                                </p>
                              </td>

                            </tr>
                          </>
                        ))
                        }
                      </>
                    ) : (
                      <tr>
                        <td>tidak ada</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>


          <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            {/* <button
              onClick={toggleModal}
              className="flex items-center gap-1 rounded-md bg-white px-4  py-2 text-end text-black shadow-xl hover:bg-slate-100 focus:outline-none focus:ring focus:ring-indigo-500 focus:ring-offset-2 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="h-6 w-6 text-black dark:text-white"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              Pasienberobat
            </button> */}

            {/* <div className="mb-4 flex items-center justify-end">
           
              <input
                type="text"
                placeholder="Cari Pasienberobat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 rounded-l-md border border-[#e0e0e0] bg-white px-6 py-3 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md dark:bg-slate-500 dark:text-white md:w-56"
              />
            </div> */}
            <div className="max-w-full overflow-x-auto overflow-y-hidden">
              <table className="w-full table-auto">
                <thead>

                  <tr className="bg-slate-2 text-left dark:bg-meta-4">
                    <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white">
                      Nomor Urut
                    </th>
                    <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white">
                      Keluhan
                    </th>
                    <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                      Harga
                    </th>
                    <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                      Tanggal Daftar
                    </th>
                    <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                      Status
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {pasienberobat && pasienberobat.length > 0 ? (
                    <>
                      {pasienberobat.map((Item, key) => (
                        <tr key={key}>
                          <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            <p className="text-black dark:text-white">
                              {Item.no_urut}
                            </p>
                          </td>
                          <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            <p className="text-black dark:text-white">
                              {Item.keluhan}
                            </p>
                          </td>

                          <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            <p className="text-black dark:text-white">
                              {Item.harga_total}
                            </p>
                          </td>
                          <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            <p className="text-black dark:text-white">
                              {format(
                                new Date(Item.createdAt),
                                "dd MMMM yyyy",
                                { locale: id },
                              )}
                            </p>
                          </td>
                          <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            <p className="text-black dark:text-white">
                              {Item.status == '3' ? "Sudah Selesai" : (Item.status == '2' ? "Sedang Berobat" : (Item.status == '1' ? "Sudah Datang" : "Belum Datang"))}
                            </p>
                          </td>
                          <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            <div className="flex items-center space-x-3.5">

                              <a href={`/daftar/pasienberobat/detail/${Item.id}`} className="hover:text-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))
                      }
                    </>
                  ) : (
                    <tr>
                      <td>tidak ada</td>
                    </tr>
                  )}
                </tbody>
              </table>
              {/* pagination */}
              <div className="my-4 flex justify-center gap-5">
                <button
                  onClick={() =>
                    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="rounded-md bg-slate-200 px-3 py-1 hover:bg-slate-400"
                >
                  Prev
                </button>
                <div className="flex">
                  {Array.from(
                    { length: Math.min(totalPages, 5) },
                    (_, index) => (
                      <button
                        key={index}
                        onClick={
                          () => setCurrentPage(firstPage + index) // Memperbarui halaman berdasarkan indeks dan halaman pertama yang ditampilkan
                        }
                        className={`mx-1 rounded-md px-3 py-1 ${currentPage === firstPage + index
                          ? "bg-blue-400 to-slate-600 text-white"
                          : "bg-slate-200 hover:bg-slate-400"
                          }`}
                      >
                        {firstPage + index}{" "}
                        {/* Menggunakan halaman pertama yang ditampilkan */}
                      </button>
                    ),
                  )}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((prevPage) =>
                      Math.min(prevPage + 1, totalPages),
                    )
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-md bg-slate-200 px-3 py-1 hover:bg-slate-400"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* modal update */}
          {showUpdateModal && (
            <div className="inset-0 z-50 -mt-[760px] flex max-h-full items-center justify-center overflow-y-auto">
              <div className="//"></div>
              <div
                role="alert"
                className="container mx-auto mb-5 mt-5 w-11/12 max-w-lg md:w-2/3"
              >
                <div className="relative rounded-3xl border border-slate-400 bg-white px-5 py-8 shadow-md dark:bg-slate-700 md:px-10">
                  <h1 className="font-lg mb-4 font-bold leading-tight tracking-normal text-slate-800 dark:text-white">
                    Update Pasien
                  </h1>
                  <form onSubmit={handleUpdate}>
                    <label
                      htmlFor="nama"
                      className="text-sm font-bold leading-tight tracking-normal text-slate-800 dark:text-white"
                    >
                      Nama Barang
                    </label>
                    <input
                      type="text"
                      id="nama"
                      name="nama"
                      value={updateData.keluhan}
                      onChange={(e) =>
                        setUpdateData({
                          ...updateData,
                          keluhan: e.target.value,
                        })
                      }
                      className="mb-3 mt-2 flex h-10 w-full items-center rounded border border-slate-300 pl-3 text-sm font-normal text-slate-600 focus:border focus:border-indigo-700 focus:outline-none dark:border-slate-100 dark:bg-slate-600 dark:text-white"
                      placeholder="Nama"
                    />

                    <div>
                      <label
                        htmlFor="No Telpon"
                        className="text-sm font-bold leading-tight tracking-normal text-slate-800 dark:text-white"
                      >
                        No Telpon
                      </label>
                      <input
                        type="number"
                        id="No Telpon"
                        name="no_telp"
                        value={updateData.harga}
                        onChange={(e) =>
                          setUpdateData({
                            ...updateData,
                            harga: e.target.value,
                          })
                        }
                        className="mb-3 mt-2 flex h-10 w-full  items-center rounded border border-slate-300 pl-3 text-sm font-normal text-slate-600 focus:border focus:border-indigo-700 focus:outline-none dark:border-slate-100 dark:bg-slate-600 dark:text-white"
                      />
                    </div>






                    {/* <div>
                      <label
                        htmlFor="Gambar"
                        className="text-sm font-bold leading-tight tracking-normal text-slate-800 dark:text-white"
                      >
                        Gambar--
                      </label>
                      <input
                        type="file"
                        id="gambar"
                        name="gambar"
                        onChange={(e) =>
                          setUpdateData({
                            ...updateData,
                            gambar: e.target.files ? e.target.files[0] : null, // Memeriksa apakah e.target.files tidak null sebelum mengakses [0]
                          })
                        }
                        className="mb-3 mt-2 flex h-10 w-full items-center rounded border border-slate-300 py-[6px] pl-3 text-sm font-normal text-slate-600 focus:border focus:border-indigo-700 focus:outline-none dark:border-slate-100 dark:bg-slate-600 dark:text-white"
                        placeholder="gambar"
                      />
                    </div> */}

                    <div className="flex w-full items-center justify-start">
                      <button
                        type="button"
                        className=" rounded border bg-slate-100 px-8 py-2 text-sm text-slate-600 transition duration-150 ease-in-out hover:border-slate-400 hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                        onClick={() => setShowUpdateModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="ml-3 rounded bg-blue-700 px-8 py-2 text-sm text-white transition duration-150 ease-in-out hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2"
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                  <button
                    type="button"
                    className="absolute right-0 top-0 mr-5 mt-4 cursor-pointer rounded text-slate-400 transition duration-150 ease-in-out hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-600"
                    onClick={() => setShowUpdateModal(false)}
                    aria-label="close modal"
                    role="button"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="icon icon-tabler icon-tabler-x"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      stroke-width="2.5"
                      stroke="currentColor"
                      fill="none"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" />
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}


        </div>
      </DefaultLayout>
    </>
  );
};

export default Pasienberobat;
