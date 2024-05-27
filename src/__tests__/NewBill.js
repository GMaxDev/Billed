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
        const objInstance = new NewBill({
          document: documentMock,
          onNavigate: {},
          store: { bills: () => ({ create: createMock }) },
          localStorage: {},
        });

        // Simulation du téléchargement de fichier
        objInstance.handleChangeFile({
          preventDefault: jest.fn(),
          target: { value: "image.png" },
        });

        // Vérification du résultat
        expect(createMock).toHaveBeenCalled();
        const formData = createMock.mock.calls[0][0].data;
        expect(formData.get("email")).toEqual("user@email.com");
      });
    });
  });
});
