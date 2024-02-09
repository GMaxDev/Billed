/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import { application } from "express";

jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          status: "connected",
          type: "Employee",
        })
      );
      //Simule le rendu de l'application
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root); //Attache la div au body simulé
      router();
    });

    test("Then the form should be displayed", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      expect(screen.getByTestId("form-new-bill"));
    });

    test("Then mail icon should be highlighted", async () => {
      window.onNavigate(ROUTES_PATH.NewBill)

      const highlitedIcon = screen.getByTestId("icon-mail")
      await waitFor(() => highlitedIcon);
      expect(highlitedIcon).toHaveClass("active-icon")
    })
  });

  describe ("When I am on NewBill form", () => {
    test("Then I add File", async () => {
      //On créé une instance de newBill
      const dashboard = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: localStorageMock,
      });
  
      //On crée une fonction mock à partir de la méthode handleChangeFile de l'objet dashboard, dans lequelle on a notre class
      const handleChangeFile = jest.fn(dashboard.handleChangeFile);
      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [
            new File(["document.jpg"], "document.jpg", {
              type: "document/jpg",
            }),
          ],
        },
      });
  
      expect(handleChangeFile).toBeCalled();
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });
  })
});
