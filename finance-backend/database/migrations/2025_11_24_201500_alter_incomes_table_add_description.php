<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('incomes', function (Blueprint $table) {
            if (!Schema::hasColumn('incomes', 'description')) {
                $table->text('description')->nullable()->after('amount');
            }
        });

        if (Schema::hasColumn('incomes', 'notes') && Schema::hasColumn('incomes', 'description')) {
            DB::statement('UPDATE incomes SET description = notes WHERE notes IS NOT NULL AND notes != "" AND (description IS NULL OR description = "")');
        }
    }

    public function down(): void
    {
        Schema::table('incomes', function (Blueprint $table) {
            if (Schema::hasColumn('incomes', 'description')) {
                $table->dropColumn('description');
            }
        });
    }
};



