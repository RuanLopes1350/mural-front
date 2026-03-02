"use client"

import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table"
import { Usuario, UsuarioApi } from "@/types/eventos"
import { useState, useEffect, useCallback } from "react"
import { ToggleLeft, ToggleRight, Trash2, UserPlus, CheckCircle, XCircle } from 'lucide-react'
import { fetchData } from "@/services/api"
import Modal from "@/components/ui/modal"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
} from "@/components/ui/pagination"
import { useSession } from "next-auth/react"

const ITEMS_PER_PAGE = 10;

export default function AdministrativoPage() {
    const [todosUsuarios, setTodosUsuarios] = useState<Usuario[]>([]) // Todos os usuários da API
    const [usuarios, setUsuarios] = useState<Usuario[]>([]) // Usuários da página atual
    const [carregandoUsuarios, setCarregandoUsuarios] = useState<boolean>(true)
    const [erroUsuarios, setErroUsuarios] = useState<string | null>(null)
    const [atualizandoStatus, setAtualizandoStatus] = useState<string | null>(null)
    const [atualizandoAdmin, setAtualizandoAdmin] = useState<string | null>(null)
    const [modalAtivo, setModalAtivo] = useState<string | null>(null)
    const [sucessoModal, setSucessoModal] = useState<boolean>(false)
    const [carregandoModal, setCarregandoModal] = useState<boolean>(false)
    const [erroModal, setErroModal] = useState<string | null>(null)
    const [novoUsuarioNome, setNovoUsuarioNome] = useState<string>('')
    const [novoUsuarioEmail, setNovoUsuarioEmail] = useState<string>('')
    const [usuarioDeletando, setUsuarioDeletando] = useState<Usuario | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [totalDocs, setTotalDocs] = useState(0)
    const { data: session } = useSession();

    const alterarStatus = async (id: string, status: string) => {
        const novoStatus: 'ativo' | 'inativo' = status === 'inativo' ? 'ativo' : 'inativo';

        try {
            setAtualizandoStatus(id);

            // Atualiza tanto a lista completa quanto a lista da página atual
            setTodosUsuarios(todosUsuarios.map(usuario =>
                usuario._id === id
                    ? { ...usuario, status: novoStatus }
                    : usuario
            ));

            setUsuarios(usuarios.map(usuario =>
                usuario._id === id
                    ? { ...usuario, status: novoStatus }
                    : usuario
            ));

            const resposta = await fetchData(`/usuarios/${id}/status`, 'PATCH', undefined, { status: novoStatus });

            if (!resposta || (resposta as any).code !== 200) {
                const errorMessage = (resposta as any)?.customMessage || (resposta as any)?.message || 'Erro ao atualizar status';
                throw new Error(errorMessage);
            }
        } catch (error: any) {
            // Reverte a mudança em caso de erro
            setTodosUsuarios(todosUsuarios.map(usuario =>
                usuario._id === id
                    ? { ...usuario, status: status as 'ativo' | 'inativo' }
                    : usuario
            ));

            setUsuarios(usuarios.map(usuario =>
                usuario._id === id
                    ? { ...usuario, status: status as 'ativo' | 'inativo' }
                    : usuario
            ));
            console.log(`Erro na requisição: ${JSON.stringify(error)}`)
            alert(`Não foi possivel alterar o status do Usuário: ${error.customMessage || error.message}`);
        } finally {
            setAtualizandoStatus(null);
        }
    }

    const alterarAdmin = async (id: string, admin: boolean) => {
        const atualizando: true | false = admin === false ? true : false
        console.log(`Atualizando: ${atualizando}`)

        try {
            console.log('Iniciando requisição!')
            setAtualizandoAdmin(id);

            // Atualiza tanto a lista completa quanto a lista da página atual
            setTodosUsuarios(todosUsuarios.map(usuario =>
                usuario._id === id
                    ? { ...usuario, admin: atualizando }
                    : usuario
            ));

            setUsuarios(usuarios.map(usuario =>
                usuario._id === id
                    ? { ...usuario, admin: atualizando }
                    : usuario
            ));

            const resposta = await fetchData(`/usuarios/${id}/admin`, 'PATCH', undefined, { admin: atualizando });
            console.log(JSON.stringify(resposta))

            if (!resposta || (resposta as any).code !== 200) {
                const errorMessage = (resposta as any)?.customMessage || (resposta as any)?.message || 'Erro ao atualizar status';
                throw new Error(errorMessage);
            }
        } catch (error: any) {
            console.log(`Erro na requisição: ${JSON.stringify(error)}`)
            alert(`Não foi possivel alterar o status de admin do Usuário: ${error.message || error}`);
            // Reverte a mudança em caso de erro
            setTodosUsuarios(todosUsuarios.map(usuario =>
                usuario._id === id
                    ? { ...usuario, admin: admin as true | false }
                    : usuario
            ));

            setUsuarios(usuarios.map(usuario =>
                usuario._id === id
                    ? { ...usuario, admin: admin as true | false }
                    : usuario
            ));
        } finally {
            setAtualizandoAdmin(null);
        }
    }

    const deletarUsuario = async (id?: string) => {
        if (!id) {
            alert('Usuário inválido.');
            setUsuarioDeletando(null);
            setModalAtivo(null);
            return;
        }

        try {
            const resposta = await fetchData(`/usuarios/${id}`, 'DELETE');

            if (!resposta || (resposta as any).code !== 200) {
                const errorMessage = (resposta as any)?.customMessage || (resposta as any)?.message || 'Erro ao deletar usuário';
                throw new Error(errorMessage);
            }

            // Fecha o modal
            setUsuarioDeletando(null);
            setModalAtivo(null);

            // Atualiza a lista de usuários
            await buscarUsuarios();
        } catch (error: any) {
            console.log(`Erro na requisição: ${JSON.stringify(error)}`);
            alert(`Não foi possivel deletar o Usuário: ${error.message}`);

            // Reverte a mudança em caso de erro
            await buscarUsuarios();
        }
    }

    const buscarUsuarios = useCallback(async () => {
        try {
            setCarregandoUsuarios(true);
            setErroUsuarios(null);
            const resposta = await fetchData<UsuarioApi>('/usuarios', 'GET');

            if (resposta.code !== 200) {
                throw new Error('Erro ao buscar usuários');
            }

            const dadosUsuarios = resposta.data;

            // A API retorna todos os usuários de uma vez
            let usuariosArray: Usuario[] = [];

            if (!dadosUsuarios) {
                usuariosArray = [];
            } else if (Array.isArray(dadosUsuarios)) {
                usuariosArray = dadosUsuarios;
            } else {
                usuariosArray = [dadosUsuarios];
            }

            // Armazena todos os usuários
            setTodosUsuarios(usuariosArray);

            // Calcula paginação local
            const total = usuariosArray.length;
            const pages = Math.ceil(total / ITEMS_PER_PAGE);
            setTotalDocs(total);
            setTotalPages(pages);

            // Define a página atual (garante que não exceda o total)
            const validPage = Math.min(currentPage, pages || 1);
            setCurrentPage(validPage);

            // Pega os usuários da página atual
            const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
            const endIndex = startIndex + ITEMS_PER_PAGE;
            setUsuarios(usuariosArray.slice(startIndex, endIndex));

        } catch (erro) {
            console.error('Erro ao buscar Usuarios:', erro);
            setErroUsuarios(erro instanceof Error ? erro.message : 'Erro desconhecido')
            setTodosUsuarios([]);
            setUsuarios([]);
            setTotalPages(0);
            setTotalDocs(0);
        } finally {
            setCarregandoUsuarios(false);
        }
    }, [currentPage]);

    const cadastrarUsuario = async () => {
        try {
            setCarregandoModal(true);
            setErroModal(null);
            setSucessoModal(false);

            const resposta = await fetchData<UsuarioApi>('/usuarios', 'POST', undefined, { nome: novoUsuarioNome, email: novoUsuarioEmail, status: "ativo" })

            if (resposta.code !== 201) {
                throw new Error('Erro ao cadastrar usuário!');
            }

            setSucessoModal(true);

            // Aguarda 2 segundos e fecha o modal
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Fecha o modal e limpa os estados
            setModalAtivo(null);
            setSucessoModal(false);
            setErroModal(null);
            setNovoUsuarioNome('');
            setNovoUsuarioEmail('');

            // Volta para a primeira página e atualiza a lista de usuários
            setCurrentPage(1);
            await buscarUsuarios();
        } catch (erro) {
            console.error('Erro ao cadastrar Usuarios:', erro)
            setErroModal(erro instanceof Error ? erro.message : 'Erro desconhecido')
        } finally {
            setCarregandoModal(false);
        }
    }

    const limparModal = () => {
        setModalAtivo(null);
        setSucessoModal(false);
        setCarregandoModal(false);
        setErroModal(null);
        setNovoUsuarioNome('');
        setNovoUsuarioEmail('');
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page);

        // Pagina localmente os dados já carregados
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        setUsuarios(todosUsuarios.slice(startIndex, endIndex));
    };

    useEffect(() => {
        buscarUsuarios();
    }, [buscarUsuarios])

    // Atualiza a página quando currentPage muda (exceto na montagem inicial)
    useEffect(() => {
        if (todosUsuarios.length > 0) {
            const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
            const endIndex = startIndex + ITEMS_PER_PAGE;
            setUsuarios(todosUsuarios.slice(startIndex, endIndex));
        }
    }, [currentPage, todosUsuarios])

    return (
        <>
            {/*  Modal Zone */}
            {/* modal de Novo usuario */}
            <Modal titulo="Cadastrar um novo usuário" isOpen={modalAtivo === 'novoUsuario'} onClose={() => limparModal()} data-teste="modal-novo-usuario">
                {sucessoModal ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="mb-4">
                            <CheckCircle className="w-16 h-16 text-green-500 animate-pulse" />
                        </div>
                        <h3 className="text-xl font-semibold text-green-800 mb-2">
                            Usuário cadastrado com sucesso!
                        </h3>
                        <p className="text-sm text-gray-600">
                            Fechando automaticamente...
                        </p>
                    </div>
                ) : (
                    <form className="space-y-3.5" autoComplete="off" onSubmit={(e) => { e.preventDefault(); cadastrarUsuario(); }}>
                        {/* Mensagem de Erro */}
                        {erroModal && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-red-800 mb-1">
                                        Erro ao cadastrar usuário
                                    </h4>
                                    <p className="text-sm text-red-600">{erroModal}</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                                Nome do Usuário
                            </label>
                            <input
                                id="nome"
                                name="nome"
                                type="text"
                                autoComplete="off"
                                onChange={(e) => setNovoUsuarioNome(e.target.value)}
                                disabled={carregandoModal}
                                className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg 
                                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                         placeholder:text-gray-400 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                E-mail
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="off"
                                onChange={(e) => setNovoUsuarioEmail(e.target.value)}
                                disabled={carregandoModal}
                                className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg 
                                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                         placeholder:text-gray-400 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                                placeholder="johndoe@email.com"
                            />
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-blue-800">
                                    O usuário receberá um e-mail com instruções para criar sua senha.
                                </p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={carregandoModal || !novoUsuarioNome || !novoUsuarioEmail}
                            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium
                                     hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                                     focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg
                                     disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {carregandoModal ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Cadastrando...</span>
                                </>
                            ) : (
                                'Criar Conta'
                            )}
                        </button>
                    </form>
                )}
            </Modal>

            {/* Modal de confirmação */}
            <Modal titulo="Confirmar ação" isOpen={modalAtivo === 'confirmacaoDeletar'} onClose={() => setModalAtivo(null)} data-teste="modal-confirmar-deletar">
                <p>Deseja realmente deletar este usuario?</p>
                <p>Esta ação não pode ser desfeita.</p>
                <div className=" bg-gray-100 p-4 rounded-md flex flex-col gap-2">
                    <span>Nome: {usuarioDeletando?.nome}</span>
                    <span>Email: {usuarioDeletando?.email}</span>
                </div>
                <div className="flex justify-end mt-4">
                    <button onClick={() => setModalAtivo(null)} data-teste="btn-cancelar-deletar" className="bg-indigo-600 text-white py-2 px-4 rounded-lg cursor-pointer">
                        Cancelar
                    </button>
                    <button onClick={() => { deletarUsuario(usuarioDeletando?._id) }} data-teste="btn-confirmar-deletar" className="bg-red-600 text-white py-2 px-4 rounded-lg ml-2 cursor-pointer">
                        Deletar
                    </button>
                </div>
            </Modal>

            {/* Tela */}
            <div className="font-inter min-h-screen bg-[#F9FAFB]">
                {/* Banner */}
                <div className="relative overflow-hidden bg-indigo-700">
                    <div className="container mx-auto px-6 py-12 lg:py-16 relative z-10">
                        <div className="relative z-10 max-w-3xl">
                            <h1 className="text-3xl lg:text-4xl font-bold text-white font-inter mb-4">
                                Gerenciamento de Usuários
                            </h1>
                            <p className="text-lg text-white/90 font-inter leading-relaxed">
                                Visualize e gerencie todos os usuários cadastrados na plataforma.
                            </p>
                        </div>
                    </div>

                    {/* Elementos decorativos */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full transform translate-x-48 -translate-y-48"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-white/5 to-transparent rounded-full transform -translate-x-32 translate-y-32"></div>
                    <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-full"></div>
                    <div className="absolute bottom-20 right-32 w-40 h-40 bg-gradient-to-tl from-purple-300/15 to-transparent rounded-full"></div>
                    <div className="absolute top-32 right-20 w-16 h-16 bg-white/10 rounded-full"></div>
                    <div className="absolute top-1/2 left-10 w-12 h-12 bg-gradient-to-r from-blue-300/20 to-transparent rounded-full"></div>
                    <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-gradient-to-bl from-yellow-300/15 to-transparent rounded-full"></div>
                </div>

                {/* Conteúdo Principal */}
                <div className="container mx-auto px-6 py-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        {/* Header da Tabela */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Lista de Usuários
                            </h2>
                            <div className="flex flex-row justify-between items-center">
                                <p className="text-sm text-gray-600 mt-1">
                                    {carregandoUsuarios ? 'Carregando...' : `${totalDocs} usuário(s) cadastrado(s)`}
                                </p>

                                <button onClick={() => { setModalAtivo('novoUsuario') }} data-teste="btn-novo-usuario" className="bg-green-600 cursor-pointer p-2 rounded-2xl flex flex-row gap-2 text-white"><UserPlus />Novo Usuário</button>
                            </div>
                        </div>

                        {/* Tabela */}
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="text-gray-700 font-semibold">ID</TableHead>
                                        <TableHead className="text-gray-700 font-semibold">Nome</TableHead>
                                        <TableHead className="text-gray-700 font-semibold">E-mail</TableHead>
                                        <TableHead className="text-gray-700 font-semibold">Membro Desde</TableHead>
                                        <TableHead className="text-gray-700 font-semibold">Administrador</TableHead>
                                        <TableHead className="text-gray-700 font-semibold text-center">Ações</TableHead>
                                        <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {carregandoUsuarios ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-12">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
                                                    <span className="text-gray-600">Carregando usuários...</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : erroUsuarios ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-12">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                                                        <h3 className="text-lg font-semibold text-red-800 mb-2">
                                                            Erro ao carregar usuários
                                                        </h3>
                                                        <p className="text-red-600 text-sm">{erroUsuarios}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : usuarios.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-12">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <svg className="w-16 h-16 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                    <p className="text-lg font-medium">Nenhum usuário encontrado</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        usuarios.map((usuario, index) => (
                                            <TableRow
                                                key={usuario._id}
                                                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                                            >
                                                <TableCell className="text-gray-600 font-mono text-xs">
                                                    {usuario._id.slice(-8)}
                                                </TableCell>
                                                <TableCell className="text-gray-900 font-medium">
                                                    {usuario.nome}
                                                </TableCell>
                                                <TableCell className="text-gray-600">
                                                    {usuario.email}
                                                </TableCell>
                                                <TableCell className="text-gray-600 text-sm">
                                                    {new Date(usuario.createdAt).toLocaleDateString('pt-BR')}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-row items-center gap-2.5">
                                                        {session?.user?._id !== usuario._id && (
                                                            <button
                                                                onClick={() => alterarAdmin(usuario._id, usuario.admin)}
                                                                disabled={atualizandoAdmin === usuario._id}
                                                                className="transition-transform hover:scale-110 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                                title={usuario.admin === true ? 'Retirar Admin' : 'Atribuir Admin'}
                                                            >
                                                                {atualizandoAdmin === usuario._id ? (
                                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                                                                ) : usuario.admin === true ? (
                                                                    <div className="flex flex-row gap-2.5">
                                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                            Sim
                                                                        </span>
                                                                        <ToggleRight className="text-blue-800 w-5 h-5" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex flex-row gap-2">
                                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                            Não
                                                                        </span>
                                                                        <ToggleLeft className="text-gray-800 w-5 h-5" />
                                                                    </div>
                                                                )}
                                                            </button>
                                                        )}
                                                        {session?.user?._id === usuario._id && (
                                                            <div className="flex flex-row gap-2.5">
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                    Você
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-center gap-3">
                                                        {session?.user?._id !== usuario._id && (
                                                            <>
                                                                <button
                                                                    onClick={() => alterarStatus(usuario._id, usuario.status)}
                                                                    disabled={atualizandoStatus === usuario._id}
                                                                    className="transition-transform hover:scale-110 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    title={usuario.status === 'ativo' ? 'Desativar usuário' : 'Ativar usuário'}
                                                                >
                                                                    {atualizandoStatus === usuario._id ? (
                                                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                                                                    ) : usuario.status === 'ativo' ? (
                                                                        <ToggleRight className="text-green-600 w-5 h-5" />
                                                                    ) : (
                                                                        <ToggleLeft className="text-gray-400 w-5 h-5" />
                                                                    )}
                                                                </button>
                                                                <button
                                                                    className="transition-transform hover:scale-110 cursor-pointer"
                                                                    title="Excluir usuário"
                                                                    onClick={() => { setUsuarioDeletando(usuario); setModalAtivo('confirmacaoDeletar'); }}
                                                                >
                                                                    <Trash2 className="text-red-600 w-5 h-5" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${usuario.status === 'ativo'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {usuario.status}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Paginação */}
                        {totalPages > 1 && (
                            <div className="flex flex-col items-center space-y-4 mt-6 pb-6">
                                {/* Informação de paginação */}
                                <div className="text-sm text-gray-600">
                                    Página {currentPage} de {totalPages} ({totalDocs} usuários no total)
                                </div>

                                <Pagination>
                                    <PaginationContent>
                                        {/* Botão Anterior */}
                                        <PaginationItem>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (currentPage > 1) handlePageChange(currentPage - 1);
                                                }}
                                                disabled={currentPage === 1}
                                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === 1
                                                    ? 'pointer-events-none opacity-50 cursor-not-allowed'
                                                    : 'cursor-pointer'
                                                    } bg-white border border-gray-300 text-gray-700 hover:bg-gray-50`}
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                                Anterior
                                            </button>
                                        </PaginationItem>

                                        {/* Números das páginas */}
                                        {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = index + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = index + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + index;
                                            } else {
                                                pageNum = currentPage - 2 + index;
                                            }

                                            return (
                                                <PaginationItem key={pageNum}>
                                                    <button
                                                        type="button"
                                                        onClick={() => handlePageChange(pageNum)}
                                                        aria-current={currentPage === pageNum ? 'page' : undefined}
                                                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === pageNum
                                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600'
                                                            : 'cursor-pointer bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                </PaginationItem>
                                            );
                                        })}

                                        {/* Botão Próximo */}
                                        <PaginationItem>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (currentPage < totalPages) handlePageChange(currentPage + 1);
                                                }}
                                                disabled={currentPage === totalPages}
                                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === totalPages
                                                    ? 'pointer-events-none opacity-50 cursor-not-allowed'
                                                    : 'cursor-pointer'
                                                    } bg-white border border-gray-300 text-gray-700 hover:bg-gray-50`}
                                            >
                                                Próximo
                                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}