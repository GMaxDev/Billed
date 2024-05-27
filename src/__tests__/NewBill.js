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
      test("should save the user's email", () => {
        // On setup le localstorageMock
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            status: "connected",
            type: "Employee",
            email: "user@email.com",
          })
        );

        // On mock les fonctions et les données
        const mockGetElementById = jest.fn().mockReturnValue({});
        // On imulate l'envoie d'une facture
        const createMock = jest
          .fn()
          .mockResolvedValue({ fileUrl: "fileURL", key: "key" });
        const formatFile = new File(["img"], "image.png", {
          type: "image/png",
        });

        const documentMock = {
          querySelector: (selector) => {
            if (selector === 'input[data-testid="file"]') {
              return {
                files: [formatFile],
                addEventListener: jest.fn(),
              };
            } else {
              return { addEventListener: jest.fn() };
            }
          },
          getElementById: mockGetElementById,
        };

        // On setup une instance de test
        const storeMock = {
          bills: () => ({
            create: createMock,
          }),
        };
        const objInstance = new NewBill({
          document: documentMock,
          onNavigate: {},
          store: storeMock,
          localStorage: {},
        });

        // On simule le téléchargement du fichier
        objInstance.handleChangeFile({
          preventDefault: jest.fn(),
          target: { value: "image.png" },
        });

        // On indique ce que l'on doit avoir à la fin
        const expectedEmail = "user@email.com";
        const formData = createMock.mock.calls[0][0].data;
        console.log("formData", formData);

        expect(formData.get("email")).toEqual(expectedEmail);
      });
    });
  });
});
