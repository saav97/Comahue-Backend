searchCategorieParent = (idCategorie, categories)=>{
    const categoria = categories.find(categorie => categorie.idCategory == idCategorie);
    return (categoria.nameParent);
}

module.exports = {
    searchCategorieParent
}