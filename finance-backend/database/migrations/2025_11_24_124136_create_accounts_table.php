<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name'); // e.g., "Chase Checking", "Cash Wallet"
            $table->enum('type', ['bank', 'credit_card', 'cash', 'investment', 'loan', 'other'])->default('bank');
            $table->string('institution')->nullable(); // Bank name
            $table->string('account_number')->nullable();
            $table->decimal('balance', 15, 2)->default(0);
            $table->decimal('initial_balance', 15, 2)->default(0);
            $table->string('currency', 3)->default('USD');
            $table->string('color', 7)->nullable(); // Hex color for UI
            $table->string('icon')->nullable(); // Icon name
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('include_in_total')->default(true);
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('user_id');
            $table->index(['user_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
