/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from "@testing-library/dom";
import "@testing-library/jest-dom";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon).toHaveClass("active-icon");
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
  describe("When employee click on eye Button", () => {
    test("Then modal should be displayed", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const billsDashboard = new Bills({
        document,
        onNavigate,
        store: null,
        bills: bills,
        localStorage: window.localStorage,
      });

      /* Mock fonction JQuery */
      $.fn.modal = jest.fn();

      document.body.innerHTML = BillsUI({ data: { bills } });

      const iconEye = screen.getAllByTestId("btn-new-bill")[0];
      const handleClickIconEye = jest.fn(
        billsDashboard.handleClickIconEye(iconEye)
      );

      iconEye.addEventListener("click", handleClickIconEye);
      userEvent.click(iconEye);

      expect(handleClickIconEye).toHaveBeenCalled();
      expect($.fn.modal).toHaveBeenCalled();
      expect(screen.getByTestId("modal")).toBeTruthy(); //rajouter le testid dans la div à tester danss BillsUI
      expect(screen.getByTestId("modal-title")).toBeTruthy();//pareillement
    });
  });
  describe("When employee click on new bill button", () => {
    test("Then the new bill page should be displayed", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const billsDashboard = new Bills({
        document,
        onNavigate,
        store: null,
        bills: bills,
        localStorage: window.localStorage,
      });

      const newBillBtn = screen.getByTestId("btn-new-bill");
      const handleClickNewBill = jest.fn(billsDashboard.handleClickNewBill);

      newBillBtn.addEventListener("click", handleClickNewBill);
      userEvent.click(newBillBtn);

      expect(handleClickNewBill).toHaveBeenCalled();
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    });
  })
});
