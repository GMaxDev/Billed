/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import { application } from "express";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the form should be displayed", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      expect(screen.getByTestId("form-new-bill"));
    });

    describe("when uploading a file with the correct format", () => {
      test("should save the user's email", async () => {
        // Setup du localStorageMock
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            status: "connected",
            type: "Employee",
            email: "user@email.com",
          })
        );

        // Mock des fonctions et des données
        const createMock = jest
          .fn()
          .mockResolvedValue({ fileUrl: "fileURL", key: "key" });
        const formatFile = new File(["img"], "image.png", {
          type: "image/png",
        });

        const documentMock = {
          querySelector: (selector) =>
            selector === 'input[data-testid="file"]'
              ? { files: [formatFile], addEventListener: jest.fn() }
              : { addEventListener: jest.fn() },
          getElementById: jest.fn().mockReturnValue({}),
        };

        // Setup de l'instance de test
        const newBill = new NewBill({
          document: documentMock,
          onNavigate: {},
          store: { bills: () => ({ create: createMock }) },
          localStorage: {},
        });

        // Simulation du téléchargement de fichier
        newBill.handleChangeFile({
          preventDefault: jest.fn(),
          target: { value: "image.png" },
        });

        // Vérification du résultat
        expect(createMock).toHaveBeenCalled();
        const formData = createMock.mock.calls[0][0].data;
        expect(formData.get("email")).toEqual("user@email.com");
      });
    });
    describe("when submitting a new bill", () => {
      test("should call the update method on the store", () => {
        // Mock des fonctions et des données
        const formatFile = new File(["img"], "image.png", {
          type: "image/png",
        });
        const mockUpdate = jest.fn().mockResolvedValue({});
        const documentMock = {
          querySelector: jest.fn((selector) => ({
            files:
              selector === 'input[data-testid="file"]' ? [formatFile] : [],
            addEventListener: jest.fn(),
          })),
          getElementById: jest.fn().mockReturnValue({}),
        };
        const storeMock = { bills: () => ({ update: mockUpdate }) };
        const newBill = new NewBill({
          document: documentMock,
          onNavigate: jest.fn(),
          store: storeMock,
          localStorage: {},
        });

        // On mock la soumission du formulaire
        newBill.handleSubmit({
          preventDefault: jest.fn(),
          target: {
            querySelector: jest.fn(
              (selector) =>
                ({
                  'select[data-testid="expense-type"]': { value: "type" },
                  'input[data-testid="expense-name"]': { value: "name" },
                  'input[data-testid="amount"]': { value: "3000" },
                  'input[data-testid="datepicker"]': { value: "date" },
                  'input[data-testid="vat"]': { value: "vat" },
                  'input[data-testid="pct"]': { value: "25" },
                  'textarea[data-testid="commentary"]': { value: "commentary" },
                }[selector])
            ),
          },
        });

        // données attendu
        const expectedData = {
          email: "user@email.com",
          type: "type",
          name: "name",
          amount: 3000,
          date: "date",
          vat: "vat",
          pct: 25,
          commentary: "commentary",
          fileUrl: null,
          fileName: null,
          status: "pending",
        };

        const data = JSON.parse(mockUpdate.mock.calls[0][0].data);
        expect(data).toMatchObject(expectedData);
      });
    });
  });
});
