searchCategorieParent = (idCategorie, categories)=>{
    console.log("Cat:",idCategorie);
    const categoria = categories.find(categorie => categorie.idCategory == idCategorie);
    console.log(categoria);
    return (categoria.nameParent);
}

module.exports = {
    searchCategorieParent
}