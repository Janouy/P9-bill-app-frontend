import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", (e) => this.handleSubmit(e))
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }
  //vérifie le type de fichier lors du change
  checkFileType =(file) => {
    const typeFile = file.name.split('.').pop();
    if(typeFile === 'jpg' || typeFile === 'jpeg' || typeFile === 'png'){
      return true
    }else{
      return false
    }
  }
  //display error-data message : affichage du texte contenu dans l'argument de balise data-error et mise en forme de la cellule avec le css
  showFieldError(elt){
    elt.dataset.errorVisible="true";
  }

  hideFieldError(elt){
    elt.dataset.errorVisible="false";
  }
  handleChangeFile = e => {
    e.preventDefault()
    const file =this.document.querySelector(`input[data-testid="file"]`).files[0];
    const fileHtml = this.document.querySelector('.formData');
    if(this.checkFileType(file)){
      const filePath = e.target.value.split(/\\/g)
      const fileName = filePath[filePath.length-1]
      const formData = new FormData()
      const email = JSON.parse(localStorage.getItem("user")).email
      formData.append('file', file)
      formData.append('email', email)
      this.hideFieldError(fileHtml)
      this.store
        .bills()
        .create({
          data: formData,
          headers: {
            noContentType: true
          }
        })
        .then(({fileUrl, key}) => {
          console.log(fileUrl)
          this.billId = key
          this.fileUrl = fileUrl
          this.fileName = fileName
        }).catch(error => console.error(error))
    }else{this.showFieldError(fileHtml)}
  }
  handleSubmit = e => {
    e.preventDefault()
    const file =this.document.querySelector(`input[data-testid="file"]`).files[0];
    //console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
    if(this.checkFileType(file)){
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }else{
    return
  }
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}