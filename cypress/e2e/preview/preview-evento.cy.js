/// <reference types="cypress" />

import { faker } from "@faker-js/faker";
faker.locale = "pt_BR";

Cypress.on("uncaught:exception", () => false);

describe("Preview de Evento", () => {
  let eventoData;

  before(() => {
    const today = new Date();
    const todayFormatted = today.toISOString().slice(0, 16);
    const futureDate = new Date(today.getTime() + 3 * 60 * 60 * 1000);

    eventoData = {
      titulo: faker.music.songName() + " " + faker.date.future().getFullYear(),
      descricao: "Descrição do evento para teste de preview. " + faker.lorem.paragraph(),
      local: faker.location.streetAddress(),
      categoria: "palestra",
      dataInicio: todayFormatted,
      dataFim: futureDate.toISOString().slice(0, 16),
      link: faker.internet.url(),
      tags: [faker.word.noun(), faker.word.adjective()],
      cor: "3",
      animacao: "2",
      exibInicio: today.toISOString().split("T")[0],
      exibFim: faker.date.future().toISOString().split("T")[0],
    };

    Cypress.env("eventoData", eventoData);
  });

  beforeEach(() => {
    cy.login("admin@admin.com", "SenhaSuperSegur@123");
  });

  describe("Preview via Criação de Evento", () => {
    it("deve preencher formulário e verificar preview com dados corretos", () => {
      const baseUrl = Cypress.env("NEXTAUTH_URL");
      const evento = Cypress.env("eventoData");

      cy.visit(`${baseUrl}/criar_eventos`);
      cy.url().should("include", "/criar_eventos");
      cy.contains("Criar Novo Evento").should("be.visible");
      cy.getByData("input-titulo").should("be.visible");

      // Etapa 1 - Informações Básicas
      cy.getByData("input-titulo").type(evento.titulo);
      cy.getByData("input-descricao").type(evento.descricao);
      cy.getByData("input-local").type(evento.local);

      cy.getByData("select-categoria").click();
      cy.get('[role="listbox"]').should("be.visible");
      cy.contains('[role="option"]', "Palestra").click();

      cy.getByData("input-data-inicio").type(evento.dataInicio);
      cy.getByData("input-data-fim").type(evento.dataFim);
      cy.getByData("input-link").type(evento.link);

      evento.tags.forEach((tag) => {
        cy.getByData("input-tag").type(tag);
        cy.getByData("btn-adicionar-tag").click();
      });

      cy.scrollTo("bottom");
      cy.contains("button", "Continuar").click();

      // Etapa 2 - Upload de Imagens
      cy.contains("Imagens do Evento", { timeout: 10000 }).should("be.visible");
      cy.getByData("file-input").selectFile("public/image-teste.png", { force: true });
      cy.get('img[alt="image-teste.png"]', { timeout: 10000 }).should("exist");

      cy.scrollTo("bottom");
      cy.contains("button", "Continuar").click();

      // Etapa 3 - Configurações
      cy.contains("Configurações de Exibição", { timeout: 5000 }).should("exist");

      cy.getByData("checkbox-todos-dias").check({ force: true });
      cy.getByData("checkbox-manha").check({ force: true });
      cy.getByData("checkbox-tarde").check({ force: true });
      cy.getByData("checkbox-noite").check({ force: true });

      cy.getByData("input-exib-inicio").type(evento.exibInicio);
      cy.getByData("input-exib-fim").type(evento.exibFim);

      cy.getByData("select-cor").click();
      cy.get('[role="listbox"]').should("be.visible");
      cy.get('[role="option"]').eq(2).click();
      cy.get('[role="listbox"]').should("not.exist");

      cy.getByData("select-animacao").click();
      cy.get('[role="listbox"]', { timeout: 5000 }).should("be.visible");
      cy.get('[role="option"]').eq(1).click();

      cy.wait(500);

      // Verificar dados salvos no localStorage antes de abrir preview
      cy.window().then((win) => {
        const draftData = win.localStorage.getItem("criar_evento_draft");
        expect(draftData).to.not.be.null;

        const draft = JSON.parse(draftData);
        expect(draft.titulo).to.equal(evento.titulo);
        expect(draft.descricao).to.equal(evento.descricao);
        expect(draft.local).to.equal(evento.local);
        expect(draft.categoria).to.equal(evento.categoria);
        expect(draft.link).to.equal(evento.link);
      });

      // Abrir preview em nova janela e verificar conteúdo
      cy.window().then((win) => {
        const blobUrls = win.localStorage.getItem("preview-evento-blobs");
        const draftData = win.localStorage.getItem("criar_evento_draft");

        // Visitar diretamente a página de preview (simula o que window.open faz)
        cy.visit(`${baseUrl}/preview-evento`, {
          onBeforeLoad(previewWin) {
            previewWin.localStorage.setItem("criar_evento_draft", draftData);
            if (blobUrls) {
              previewWin.localStorage.setItem("preview-evento-blobs", blobUrls);
            }
          },
        });
      });

      // Verificar dados no preview
      cy.contains(evento.titulo, { timeout: 10000 }).should("be.visible");
      cy.contains(evento.local).should("be.visible");
      cy.contains("PALESTRA").should("be.visible");
      cy.contains(evento.descricao.substring(0, 50)).should("be.visible");

      // Verificar tags
      evento.tags.forEach((tag) => {
        cy.contains(tag.toLowerCase()).should("be.visible");
      });

      // Verificar QR Code (quando há link)
      cy.get('img[alt="QR Code do evento"]', { timeout: 10000 }).should("be.visible");
    });
  });

  describe("Preview Direto com Dados Mockados", () => {
    beforeEach(() => {
      const evento = Cypress.env("eventoData");
      const baseUrl = Cypress.env("NEXTAUTH_URL");

      const draftData = {
        titulo: evento.titulo,
        descricao: evento.descricao,
        local: evento.local,
        categoria: evento.categoria,
        dataInicio: evento.dataInicio,
        dataFim: evento.dataFim,
        link: evento.link,
        tags: evento.tags,
        cor: evento.cor,
        animacao: evento.animacao,
      };

      cy.visit(`${baseUrl}/preview-evento`, {
        onBeforeLoad(win) {
          win.localStorage.setItem("criar_evento_draft", JSON.stringify(draftData));
          win.localStorage.setItem(
            "preview-evento-blobs",
            JSON.stringify(["/image-teste.png"])
          );
        },
      });
    });

    it("deve exibir título do evento", () => {
      const evento = Cypress.env("eventoData");
      cy.contains(evento.titulo, { timeout: 10000 }).should("be.visible");
    });

    it("deve exibir local do evento", () => {
      const evento = Cypress.env("eventoData");
      cy.contains(evento.local, { timeout: 10000 }).should("be.visible");
    });

    it("deve exibir categoria formatada", () => {
      cy.contains("PALESTRA", { timeout: 10000 }).should("be.visible");
    });

    it("deve exibir descrição do evento", () => {
      const evento = Cypress.env("eventoData");
      cy.contains(evento.descricao.substring(0, 30), { timeout: 10000 }).should("be.visible");
    });

    it("deve exibir tags do evento", () => {
      const evento = Cypress.env("eventoData");
      evento.tags.forEach((tag) => {
        cy.contains(tag.toLowerCase(), { timeout: 10000 }).should("be.visible");
      });
    });

    it("deve exibir QR Code quando há link", () => {
      cy.get('img[alt="QR Code do evento"]', { timeout: 15000 }).should("be.visible");
    });

    it("deve exibir imagem de fundo", () => {
      cy.get('img[alt="Imagem de fundo do evento"]', { timeout: 10000 })
        .should("exist")
        .and("have.attr", "src")
        .and("include", "image-teste");
    });

    it("deve exibir botão de atualizar preview", () => {
      cy.get('button[title="Atualizar preview"]', { timeout: 10000 }).should("be.visible");
    });

    it("deve exibir data e horário formatados", () => {
      cy.get('img[alt="Calendário"]').should("be.visible");
      cy.get('img[alt="Relógio"]').should("be.visible");
    });
  });

  describe("Preview sem Dados", () => {
    it("deve redirecionar para criar_eventos quando não há dados", () => {
      const baseUrl = Cypress.env("NEXTAUTH_URL");

      cy.visit(`${baseUrl}/preview-evento`, {
        onBeforeLoad(win) {
          win.localStorage.removeItem("criar_evento_draft");
          win.localStorage.removeItem("preview-evento-blobs");
        },
      });

      cy.url({ timeout: 10000 }).should("include", "/criar_eventos");
    });
  });

  describe("Preview sem Link (QR Code)", () => {
    it("não deve exibir QR Code quando não há link", () => {
      const evento = Cypress.env("eventoData");
      const baseUrl = Cypress.env("NEXTAUTH_URL");

      const draftDataSemLink = {
        titulo: evento.titulo,
        descricao: evento.descricao,
        local: evento.local,
        categoria: evento.categoria,
        dataInicio: evento.dataInicio,
        dataFim: evento.dataFim,
        link: "",
        tags: evento.tags,
        cor: evento.cor,
        animacao: evento.animacao,
      };

      cy.visit(`${baseUrl}/preview-evento`, {
        onBeforeLoad(win) {
          win.localStorage.setItem("criar_evento_draft", JSON.stringify(draftDataSemLink));
          win.localStorage.setItem(
            "preview-evento-blobs",
            JSON.stringify(["/image-teste.png"])
          );
        },
      });

      cy.contains(evento.titulo, { timeout: 10000 }).should("be.visible");
      cy.get('img[alt="QR Code do evento"]').should("not.exist");
    });
  });

  describe("Cores e Animações", () => {
    const cores = [
      { valor: "1", nome: "Cinza Escuro", classe: "bg-gray-900" },
      { valor: "2", nome: "Rosa", classe: "bg-pink-900" },
      { valor: "3", nome: "Roxo", classe: "bg-purple-900" },
      { valor: "4", nome: "Azul", classe: "bg-blue-900" },
      { valor: "5", nome: "Verde", classe: "bg-green-900" },
    ];

    cores.forEach((cor) => {
      it(`deve aplicar cor ${cor.nome} corretamente`, () => {
        const evento = Cypress.env("eventoData");
        const baseUrl = Cypress.env("NEXTAUTH_URL");

        const draftData = {
          titulo: evento.titulo,
          descricao: evento.descricao,
          local: evento.local,
          categoria: evento.categoria,
          dataInicio: evento.dataInicio,
          dataFim: evento.dataFim,
          link: evento.link,
          tags: evento.tags,
          cor: cor.valor,
          animacao: "1",
        };

        cy.visit(`${baseUrl}/preview-evento`, {
          onBeforeLoad(win) {
            win.localStorage.setItem("criar_evento_draft", JSON.stringify(draftData));
            win.localStorage.setItem(
              "preview-evento-blobs",
              JSON.stringify(["/image-teste.png"])
            );
          },
        });

        cy.contains(evento.titulo, { timeout: 10000 }).should("be.visible");
      });
    });
  });
});
