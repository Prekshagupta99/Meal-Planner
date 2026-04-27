export type GroceryCategory =
  | "Produce"
  | "Dairy & Eggs"
  | "Pantry"
  | "Spices"
  | "Proteins"
  | "Grains & Bread"
  | "Condiments";

export type CommonGrocery = { name: string; category: GroceryCategory };

export const COMMON_GROCERIES: CommonGrocery[] = [
  // Produce
  { name: "Onion", category: "Produce" },
  { name: "Tomato", category: "Produce" },
  { name: "Potato", category: "Produce" },
  { name: "Garlic", category: "Produce" },
  { name: "Ginger", category: "Produce" },
  { name: "Carrot", category: "Produce" },
  { name: "Cucumber", category: "Produce" },
  { name: "Bell Pepper", category: "Produce" },
  { name: "Cauliflower", category: "Produce" },
  { name: "Cabbage", category: "Produce" },
  { name: "Lemon", category: "Produce" },
  { name: "Banana", category: "Produce" },
  { name: "Apple", category: "Produce" },
  { name: "Orange", category: "Produce" },
  { name: "Berries", category: "Produce" },
  { name: "Avocado", category: "Produce" },
  { name: "Coriander", category: "Produce" },
  { name: "Mint", category: "Produce" },
  { name: "Basil", category: "Produce" },
  { name: "Spring Onion", category: "Produce" },
  { name: "Green Chili", category: "Produce" },
  { name: "Curry Leaves", category: "Produce" },
  { name: "Parsley", category: "Produce" },

  // Dairy & Eggs
  { name: "Milk", category: "Dairy & Eggs" },
  { name: "Yogurt", category: "Dairy & Eggs" },
  { name: "Butter", category: "Dairy & Eggs" },
  { name: "Cheese", category: "Dairy & Eggs" },
  { name: "Cream", category: "Dairy & Eggs" },
  { name: "Paneer", category: "Dairy & Eggs" },
  { name: "Eggs", category: "Dairy & Eggs" },

  // Proteins
  { name: "Chicken", category: "Proteins" },
  { name: "Chicken Sausage", category: "Proteins" },
  { name: "Fish", category: "Proteins" },
  { name: "Chickpeas", category: "Proteins" },
  { name: "Rajma", category: "Proteins" },
  { name: "Dal", category: "Proteins" },
  { name: "Almonds", category: "Proteins" },
  { name: "Peanuts", category: "Proteins" },
  { name: "Sunflower Seeds", category: "Proteins" },
  { name: "Cashews", category: "Proteins" },

  // Grains & Bread
  { name: "Rice", category: "Grains & Bread" },
  { name: "Bread", category: "Grains & Bread" },
  { name: "Pasta", category: "Grains & Bread" },
  { name: "Noodles", category: "Grains & Bread" },
  { name: "Oats", category: "Grains & Bread" },
  { name: "Poha", category: "Grains & Bread" },
  { name: "Flour", category: "Grains & Bread" },
  { name: "Granola", category: "Grains & Bread" },
  { name: "Breadcrumbs", category: "Grains & Bread" },
  { name: "Popcorn Kernels", category: "Grains & Bread" },
  { name: "Peas", category: "Grains & Bread" },

  // Pantry
  { name: "Oil", category: "Pantry" },
  { name: "Olive Oil", category: "Pantry" },
  { name: "Sugar", category: "Pantry" },
  { name: "Salt", category: "Pantry" },
  { name: "Honey", category: "Pantry" },
  { name: "Peanut Butter", category: "Pantry" },
  { name: "Hummus", category: "Pantry" },
  { name: "Raisins", category: "Pantry" },
  { name: "Tea", category: "Pantry" },
  { name: "Yeast", category: "Pantry" },
  { name: "Water", category: "Pantry" },

  // Condiments
  { name: "Soy Sauce", category: "Condiments" },
  { name: "Vinegar", category: "Condiments" },
  { name: "Ginger Garlic Paste", category: "Condiments" },

  // Spices
  { name: "Cumin Seeds", category: "Spices" },
  { name: "Mustard Seeds", category: "Spices" },
  { name: "Turmeric", category: "Spices" },
  { name: "Chili Powder", category: "Spices" },
  { name: "Garam Masala", category: "Spices" },
  { name: "Chaat Masala", category: "Spices" },
  { name: "Biryani Masala", category: "Spices" },
  { name: "Paprika", category: "Spices" },
  { name: "Pepper", category: "Spices" },
  { name: "Cinnamon", category: "Spices" },
  { name: "Cardamom", category: "Spices" },
  { name: "Cloves", category: "Spices" },
  { name: "Bay Leaf", category: "Spices" },
  { name: "Chili Flakes", category: "Spices" },
];

export const GROCERY_CATEGORIES: GroceryCategory[] = [
  "Produce",
  "Dairy & Eggs",
  "Proteins",
  "Grains & Bread",
  "Pantry",
  "Spices",
  "Condiments",
];
