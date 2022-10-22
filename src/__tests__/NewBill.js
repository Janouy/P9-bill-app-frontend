/**
 * @jest-environment jsdom
 */


import {fireEvent, screen} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import userEvent from '@testing-library/user-event'
import { ROUTES_PATH } from "../constants/routes"
import mockStore from "../__mocks__/store"
jest.mock("../app/store", () => mockStore)
import router from "../app/Router"
const bill = {
  "id": "47qAXb6fIm2zOKkLzMro",
  "vat": "80",
  "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
  "status": "accepted",
  "type": "Hôtel et logement",
  "commentAdmin": "ok",
  "commentary": "séminaire billed",
  "name": "encore",
  "fileName": "preview-facture-free-201801-pdf-1.jpg",
  "date": "2004-04-04",
  "amount": 400,
  "email": "a@a",
  "pct": 20
}


let newBillContainer
let onNavigate

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  window.localStorage.setItem('user', JSON.stringify({
    type: 'Employee'
  }))
  const root = document.createElement("div")
  root.setAttribute("id", "root")
  document.body.append(root)
  root.innerHTML = NewBillUI()
  const store = mockStore;
  onNavigate = jest.fn()
  newBillContainer = new NewBill({ document, onNavigate, store, localStorage })
});
afterEach(() => {
  document.body.innerHTML = ''
})
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    it("Should renders New Bill page", () => {
     
      const inputTypeOfExpense = screen.getByTestId("expense-type");
      expect(inputTypeOfExpense.value).toBe("Transports");

      const inputNameOfExpense = screen.getByTestId("expense-name");
      expect(inputNameOfExpense.value).toBe("");

      const inputDateOfExpense = screen.getByTestId("datepicker");
      expect(inputDateOfExpense.value).toBe("");

      const inputAmountOfExpense = screen.getByTestId("amount");
      expect(inputAmountOfExpense.value).toBe("");

      const inputVatOfExpense = screen.getByTestId("vat");
      expect(inputVatOfExpense.value).toBe("");

      const inputPctOfExpense = screen.getByTestId("pct");
      expect(inputPctOfExpense.value).toBe("");

      const inputCommentaryOfExpense = screen.getByTestId("commentary");
      expect(inputCommentaryOfExpense.value).toBe("");

      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
      expect(screen.getByTestId("file")).toBeTruthy();
    });
    describe('When I want to upload a file', () => {
      it('Should upload the file in the input', () => {

        const file = new File(['test'], 'test.png', {type: 'image/png'});
        const input = screen.getByLabelText(/justificatif/i)
        userEvent.upload(input, file)

        expect(input.files[0]).toStrictEqual(file)
        expect(input.files.item(0)).toStrictEqual(file)
        expect(input.files).toHaveLength(1)
      })
    })
    describe('When I want to load a file, and the file type is not png, jpg or jpeg', () => {
      it('Should display an error message', () => {
        const file = new File(['hello'], 'hello.txt', {type: 'text/plain'});
        const input = screen.getByLabelText(/justificatif/i)
        userEvent.upload(input, file)
        expect(input.parentNode.dataset.errorVisible).toEqual("true")
      })
    })
    describe('When I want to submit a new bill', () => {
      it('Should send the new Bill Form', async () => {
       
        const selectType = screen.getByTestId("expense-type");
        fireEvent.change(selectType, {
          target: { value: "Transports" }
        });
        fireEvent.change(screen.getByTestId("expense-name"), {target: {value: 'Vol Paris-Nice'}})
        fireEvent.change(screen.getByTestId("datepicker"), {target: {value: '2001-05-06'}})
        fireEvent.change(screen.getByTestId("amount"), {target: {value: 350}})
        fireEvent.change(screen.getByTestId("vat"), {target: {value: 20}})
        fireEvent.change(screen.getByTestId("pct"), {target: {value: 60}})
        const file = new File(['test'], 'test.png', {type: 'image/png'});
        const input = screen.getByLabelText(/justificatif/i)
        userEvent.upload(input, file)
       
        const form = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.spyOn(newBillContainer, 'handleSubmit')
        fireEvent.submit(form)
        expect(screen.getByTestId("form-new-bill")).toBeTruthy();
        expect(handleSubmit).toHaveBeenCalled();
       
      })
      describe("When an error occurs on API", () => {
        beforeEach(() => {
          jest.spyOn(mockStore, "bills")
          console.error = jest.fn()
        })
       it("Should not fetch bills from an API and fail with 404 message error", async () => {
          mockStore.bills.mockImplementationOnce(() => {
            return {
              create : () =>  {
                return Promise.reject(new Error("Erreur 401"))
              }
            }
          })
          await new Promise(process.nextTick);
          expect(screen.queryByText("Envoyer une note de frais")).toBeTruthy()
        })
        it("Should not fetch bills from an API and fails with 500 message error", async () => {
          mockStore.bills.mockImplementationOnce(() => {
            return {
              create : () =>  {
                return Promise.reject(new Error("Erreur 500"))
              }
            }})
          await new Promise(process.nextTick);
          expect(screen.queryByText("Envoyer une note de frais")).toBeTruthy()
        })
      })
      
        
      
    })
  })
})
