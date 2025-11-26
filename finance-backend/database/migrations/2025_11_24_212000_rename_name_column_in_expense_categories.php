<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expense_categories', function (Blueprint $table) {
            if (Schema::hasColumn('expense_categories', 'name') && !Schema::hasColumn('expense_categories', 'category_name')) {
                $table->renameColumn('name', 'category_name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('expense_categories', function (Blueprint $table) {
            if (Schema::hasColumn('expense_categories', 'category_name') && !Schema::hasColumn('expense_categories', 'name')) {
                $table->renameColumn('category_name', 'name');
            }
        });
    }
};



